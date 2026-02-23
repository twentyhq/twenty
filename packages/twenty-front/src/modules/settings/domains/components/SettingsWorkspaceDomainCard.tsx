import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconWorld, Status } from 'twenty-ui/display';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const SettingsWorkspaceDomainCard = () => {
  const { t } = useLingui();
  const isMultiWorkspaceEnabled = useRecoilValueV2(
    isMultiWorkspaceEnabledState,
  );
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

  if (!isMultiWorkspaceEnabled) {
    return null;
  }

  return (
    <UndecoratedLink to={getSettingsPath(SettingsPath.Domain)}>
      <SettingsCard
        title={t`Customize Domain`}
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
  );
};
