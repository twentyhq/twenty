import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsEnterpriseFeatureGateCard } from '@/settings/components/SettingsEnterpriseFeatureGateCard';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { SettingsOptionCardContentCounter } from '@/settings/components/SettingsOptions/SettingsOptionCardContentCounter';
import { SettingsRoleDefaultRole } from '@/settings/roles/components/SettingsRolesDefaultRole';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { SettingsSecurityAuthBypassOptionsList } from '@/settings/security/components/SettingsSecurityAuthBypassOptionsList';
import { SettingsSecurityAuthProvidersOptionsList } from '@/settings/security/components/SettingsSecurityAuthProvidersOptionsList';
import { SettingsSecurityEditableProfileFields } from '@/settings/security/components/SettingsSecurityEditableProfileFields';
import { SettingsSecurityIframeOrigins } from '@/settings/security/components/SettingsSecurityIframeOrigins';
import { SettingsSsoIdentitiesProvidersListCard } from '@/settings/security/components/sso/SettingsSsoIdentitiesProvidersListCard';
import { ssoIdentitiesProvidersState } from '@/settings/security/states/ssoIdentitiesProvidersState';
import { ImpersonationSwitch } from '@/settings/workspace/components/ImpersonationSwitch';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section, useToast } from 'twenty-ui/components';
import { IconClockHour8, IconHistory, IconTrash } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { OrganizationAdornment } from '~/pages/settings/enterprise/components/OrganizationAdornment';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledMainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[10]};
  min-height: 200px;
`;

const StyledSectionContainer = styled.div`
  flex-shrink: 0;
`;

export const SettingsSecuritySettings = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);
  const authProviders = useAtomStateValue(authProvidersState);
  const ssoIdentitiesProviders = useAtomStateValue(ssoIdentitiesProvidersState);
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const saveTrashRetention = useDebouncedCallback(async (value: number) => {
    try {
      await updateWorkspace({
        variables: {
          input: {
            trashRetentionDays: value,
          },
        },
      });
    } catch (err) {
      enqueueToast(getToastOptionsFromError({ error: err }));
    }
  }, 500);

  const saveEventLogRetention = useDebouncedCallback(async (value: number) => {
    try {
      await updateWorkspace({
        variables: {
          input: {
            eventLogRetentionDays: value,
          },
        },
      });
    } catch (err) {
      enqueueToast(getToastOptionsFromError({ error: err }));
    }
  }, 500);

  const handleTrashRetentionDaysChange = (value: number) => {
    if (!currentWorkspace) {
      return;
    }

    if (value === currentWorkspace.trashRetentionDays) {
      return;
    }

    setCurrentWorkspace({
      ...currentWorkspace,
      trashRetentionDays: value,
    });

    saveTrashRetention(value);
  };

  const handleEventLogRetentionDaysChange = (value: number) => {
    if (!currentWorkspace) {
      return;
    }

    if (value === currentWorkspace.eventLogRetentionDays) {
      return;
    }

    setCurrentWorkspace({
      ...currentWorkspace,
      eventLogRetentionDays: value,
    });

    saveEventLogRetention(value);
  };

  const roles = useSettingsAllRoles();

  const hasSsoIdentityProviders = ssoIdentitiesProviders.length > 0;
  const hasDirectAuthEnabled =
    currentWorkspace?.isGoogleAuthEnabled ||
    currentWorkspace?.isMicrosoftAuthEnabled ||
    currentWorkspace?.isPasswordAuthEnabled;
  const hasBypassProviderAvailable =
    authProviders?.google ||
    authProviders?.microsoft ||
    authProviders?.password;
  const shouldShowBypassSection =
    hasSsoIdentityProviders &&
    !hasDirectAuthEnabled &&
    hasBypassProviderAvailable;

  const hasEnterpriseAccess =
    currentWorkspace?.hasValidEnterpriseValidityToken === true;
  const isEventLogsEnabled = hasEnterpriseAccess && isClickHouseConfigured;

  return (
    <>
      <SettingsRolesQueryEffect />
      <StyledMainContent>
        <StyledSectionContainer>
          <Section.Root>
            <Section.Header
              title={t`SSO`}
              description={t`Configure an SSO connection`}
              adornment={<OrganizationAdornment />}
            />
            <SettingsSsoIdentitiesProvidersListCard />
          </Section.Root>
        </StyledSectionContainer>

        <Section.Root>
          <StyledContainer>
            <Section.Header
              title={t`Authentication`}
              description={t`Customize your workspace security`}
            />
            <SettingsSecurityAuthProvidersOptionsList />
          </StyledContainer>
        </Section.Root>
        <Section.Root>
          <StyledContainer>
            <Section.Header
              title={t`Editable Profile Fields`}
              description={t`Choose which profile fields users with the Edit Profile permission can modify`}
            />
            <SettingsSecurityEditableProfileFields />
          </StyledContainer>
        </Section.Root>
        <SettingsRoleDefaultRole roles={roles} />
        <SettingsSecurityIframeOrigins />
        {shouldShowBypassSection && (
          <Section.Root>
            <StyledContainer>
              <Section.Header
                title={t`SSO Bypass`}
                description={t`Configure fallback login methods for users with SSO bypass permissions`}
              />
              <SettingsSecurityAuthBypassOptionsList />
            </StyledContainer>
          </Section.Root>
        )}
        {isMultiWorkspaceEnabled && (
          <Section.Root>
            <Section.Header
              title={t`Support`}
              description={t`Manage support access settings`}
            />
            <ImpersonationSwitch />
          </Section.Root>
        )}
        <Section.Root>
          <Section.Header
            title={t`Audit Logs`}
            description={t`Configure how long audit logs are retained`}
            adornment={<OrganizationAdornment />}
          />
          {hasEnterpriseAccess ? (
            <Card.Root rounded>
              {isEventLogsEnabled ? (
                <SettingsOptionCardContentCounter
                  Icon={IconClockHour8}
                  title={t`Log retention`}
                  description={t`Number of days to retain audit logs (30-1095 days)`}
                  value={currentWorkspace?.eventLogRetentionDays ?? 90}
                  onChange={handleEventLogRetentionDaysChange}
                  minValue={30}
                  maxValue={1095}
                  showButtons={false}
                />
              ) : (
                <SettingsOptionCardContentButton
                  Icon={IconHistory}
                  title={t`Audit Logs`}
                  description={t`ClickHouse is required for audit logs. Contact your administrator.`}
                />
              )}
            </Card.Root>
          ) : (
            <SettingsEnterpriseFeatureGateCard
              title={t`Organization feature`}
              description={t`Upgrade to Organization to access audit logs.`}
              buttonTitle={t`Activate`}
            />
          )}
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Other`}
            description={t`Other security settings`}
          />
          <Card.Root rounded>
            <SettingsOptionCardContentCounter
              Icon={IconTrash}
              title={t`Erasure of soft-deleted records`}
              description={t`Permanent deletion. Enter the number of days.`}
              value={currentWorkspace?.trashRetentionDays ?? 14}
              onChange={handleTrashRetentionDaysChange}
              minValue={0}
              showButtons={false}
            />
          </Card.Root>
        </Section.Root>
      </StyledMainContent>
    </>
  );
};
