import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCloudflareIntegrationEnabledState } from '@/client-config/states/isCloudflareIntegrationEnabledState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/data-display';
import { IconWorld, IconWorldWww } from 'twenty-ui/icon';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

export const SettingsWorkspaceDomainCard = () => {
  const { t } = useLingui();
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const isCloudflareIntegrationEnabled = useAtomStateValue(
    isCloudflareIntegrationEnabledState,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  if (!isMultiWorkspaceEnabled) {
    return null;
  }

  return (
    <StyledContainer>
      <UndecoratedLink to={getSettingsPath(SettingsPath.Subdomain)} fullWidth>
        <SettingsCard title={t`Subdomain`} Icon={<IconWorldWww />} />
      </UndecoratedLink>
      {isCloudflareIntegrationEnabled && (
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.CustomDomain)}
          fullWidth
        >
          <SettingsCard
            title={t`Custom Domain`}
            Icon={<IconWorld />}
            Status={
              currentWorkspace?.customDomain &&
              currentWorkspace?.isCustomDomainEnabled ? (
                <Status text={t`Active`} color="turquoise" />
              ) : currentWorkspace?.customDomain ? (
                <Status text={t`Inactive`} color="orange" />
              ) : undefined
            }
          />
        </UndecoratedLink>
      )}
    </StyledContainer>
  );
};
