import { useLingui } from '@lingui/react/macro';

import { isEmailGroupEnabledState } from '@/client-config/states/isEmailGroupEnabledState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsWorkspaceEmailGroupSection } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupSection';
import { SettingsWorkspaceEmailingDomainsSection } from '@/settings/workspace/components/SettingsWorkspaceEmailingDomainsSection';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const SettingsWorkspaceEmail = () => {
  const { t } = useLingui();

  const isEmailGroupEnabled = useAtomStateValue(isEmailGroupEnabledState);
  const isEmailGroupFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  if (!isEmailGroupFeatureEnabled) {
    return null;
  }

  const showEmailGroupSection = isEmailGroupEnabled;

  return (
    <SubMenuTopBarContainer
      title={t`Email`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`Email` },
      ]}
    >
      <SettingsPageContainer>
        {showEmailGroupSection && <SettingsWorkspaceEmailGroupSection />}
        <SettingsWorkspaceEmailingDomainsSection />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
