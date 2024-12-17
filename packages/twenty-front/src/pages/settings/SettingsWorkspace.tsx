import {
  GithubVersionLink,
  H2Title,
  Section,
  IconWorld,
  UndecoratedLink,
} from 'twenty-ui';
import { useRecoilValue } from 'recoil';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { NameField } from '@/settings/workspace/components/NameField';
import { ToggleImpersonate } from '@/settings/workspace/components/ToggleImpersonate';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import packageJson from '../../../package.json';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';

export const SettingsWorkspace = () => {
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  return (
    <SubMenuTopBarContainer
      title="General"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'General' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="Picture" />
          <WorkspaceLogoUploader />
        </Section>
        <Section>
          <H2Title title="Name" description="Name of your workspace" />
          <NameField />
        </Section>
        {isMultiWorkspaceEnabled && (
          <>
            <Section>
              <H2Title
                title="Domain"
                description="Edit your subdomain name or set a custom domain."
              />
              <UndecoratedLink to={getSettingsPagePath(SettingsPath.Domain)}>
                <SettingsCard title="Customize Domain" Icon={<IconWorld />} />
              </UndecoratedLink>
            </Section>
            <Section>
              <H2Title
                title="Support"
                adornment={<ToggleImpersonate />}
                description="Grant Twenty support temporary access to your workspace so we can troubleshoot problems or recover content on your behalf. You can revoke access at any time."
              />
            </Section>
          </>
        )}
        <Section>
          <DeleteWorkspace />
        </Section>
        <Section>
          <GithubVersionLink version={packageJson.version} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
