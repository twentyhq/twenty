import { useLingui } from '@lingui/react/macro';

import { isEmailGroupEnabledState } from '@/client-config/states/isEmailGroupEnabledState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { SettingsWorkspaceEmailGroupSection } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupSection';
import { NameField } from '@/settings/workspace/components/NameField';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

export const SettingsWorkspace = () => {
  const { t } = useLingui();

  const isEmailGroupEnabled = useAtomStateValue(isEmailGroupEnabledState);
  const isEmailGroupFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );
  const showEmailGroupSection =
    isEmailGroupEnabled && isEmailGroupFeatureEnabled;

  return (
    <SubMenuTopBarContainer
      title={t`General`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`General` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t`Picture`} />
          <WorkspaceLogoUploader />
        </Section>
        <Section>
          <H2Title title={t`Name`} description={t`Name of your workspace`} />
          <NameField />
        </Section>

        {showEmailGroupSection && <SettingsWorkspaceEmailGroupSection />}

        <Section>
          <DeleteWorkspace />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
