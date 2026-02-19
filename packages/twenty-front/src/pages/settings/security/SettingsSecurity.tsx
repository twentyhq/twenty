import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { SettingsOptionCardContentCounter } from '@/settings/components/SettingsOptions/SettingsOptionCardContentCounter';
import { Separator } from '@/settings/components/Separator';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSSOIdentitiesProvidersListCard } from '@/settings/security/components/SSO/SettingsSSOIdentitiesProvidersListCard';
import { SettingsSecurityAuthBypassOptionsList } from '@/settings/security/components/SettingsSecurityAuthBypassOptionsList';
import { SettingsSecurityAuthProvidersOptionsList } from '@/settings/security/components/SettingsSecurityAuthProvidersOptionsList';
import { SettingsSecurityEditableProfileFields } from '@/settings/security/components/SettingsSecurityEditableProfileFields';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { ToggleImpersonate } from '@/settings/workspace/components/ToggleImpersonate';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ApolloError } from '@apollo/client';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import {
  H2Title,
  IconClockHour8,
  IconHistory,
  IconLock,
  IconTrash,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledMainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(10)};
  min-height: 200px;
`;

const StyledSection = styled(Section)`
  flex-shrink: 0;
`;

const StyledLink = styled(Link, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'isDisabled',
})<{ isDisabled: boolean }>`
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};
  text-decoration: none;
`;

export const SettingsSecurity = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();

  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const isClickHouseConfigured = useRecoilValue(isClickHouseConfiguredState);
  const authProviders = useRecoilValueV2(authProvidersState);
  const SSOIdentitiesProviders = useRecoilValue(SSOIdentitiesProvidersState);
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useUpdateWorkspaceMutation();

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
      enqueueErrorSnackBar({
        apolloError: err instanceof ApolloError ? err : undefined,
      });
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
      enqueueErrorSnackBar({
        apolloError: err instanceof ApolloError ? err : undefined,
      });
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

  const hasSsoIdentityProviders = SSOIdentitiesProviders.length > 0;
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

  const hasEnterpriseAccess = currentWorkspace?.hasValidEnterpriseKey === true;
  const isEventLogsEnabled = hasEnterpriseAccess && isClickHouseConfigured;

  return (
    <SubMenuTopBarContainer
      title={t`Security`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Security</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <StyledMainContent>
          <StyledSection>
            <H2Title
              title={t`SSO`}
              description={t`Configure an SSO connection`}
              adornment={
                <Tag
                  text={t`Enterprise`}
                  color="transparent"
                  Icon={IconLock}
                  variant="border"
                />
              }
            />
            <SettingsSSOIdentitiesProvidersListCard />
          </StyledSection>

          <Section>
            <StyledContainer>
              <H2Title
                title={t`Authentication`}
                description={t`Customize your workspace security`}
              />
              <SettingsSecurityAuthProvidersOptionsList />
            </StyledContainer>
          </Section>
          <Section>
            <StyledContainer>
              <H2Title
                title={t`Editable Profile Fields`}
                description={t`Choose which profile fields users with the Edit Profile permission can modify`}
              />
              <SettingsSecurityEditableProfileFields />
            </StyledContainer>
          </Section>
          {shouldShowBypassSection && (
            <Section>
              <StyledContainer>
                <H2Title
                  title={t`SSO Bypass`}
                  description={t`Configure fallback login methods for users with SSO bypass permissions`}
                />
                <SettingsSecurityAuthBypassOptionsList />
              </StyledContainer>
            </Section>
          )}
          {isMultiWorkspaceEnabled && (
            <Section>
              <H2Title
                title={t`Support`}
                description={t`Manage support access settings`}
              />
              <ToggleImpersonate />
            </Section>
          )}
          <Section>
            <H2Title
              title={t`Audit Logs`}
              description={t`View workspace activity logs`}
              adornment={
                <Tag
                  text={t`Enterprise`}
                  color="transparent"
                  Icon={IconLock}
                  variant="border"
                />
              }
            />
            <Card rounded>
              <SettingsOptionCardContentButton
                Icon={IconHistory}
                title={t`Workspace Events`}
                description={
                  !isClickHouseConfigured
                    ? t`ClickHouse is required for audit logs. Contact your administrator.`
                    : !hasEnterpriseAccess
                      ? t`Upgrade to Enterprise to access audit logs`
                      : t`View and filter events, page views, object changes`
                }
                Button={
                  <StyledLink
                    to={getSettingsPath(SettingsPath.EventLogs)}
                    isDisabled={!isEventLogsEnabled}
                  >
                    <Button
                      title={t`View Logs`}
                      variant="secondary"
                      size="small"
                      disabled={!isEventLogsEnabled}
                    />
                  </StyledLink>
                }
              />
              {isEventLogsEnabled && (
                <>
                  <Separator />
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
                </>
              )}
            </Card>
          </Section>
          <Section>
            <H2Title
              title={t`Other`}
              description={t`Other security settings`}
            />
            <Card rounded>
              <SettingsOptionCardContentCounter
                Icon={IconTrash}
                title={t`Erasure of soft-deleted records`}
                description={t`Permanent deletion. Enter the number of days.`}
                value={currentWorkspace?.trashRetentionDays ?? 14}
                onChange={handleTrashRetentionDaysChange}
                minValue={0}
                showButtons={false}
              />
            </Card>
          </Section>
        </StyledMainContent>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
