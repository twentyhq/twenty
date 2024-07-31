// @ts-expect-error external library has a typing issue
import { RevertConnect } from '@revertdotdev/revert-react';
import { IconSettings } from 'twenty-ui';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useRecoilValue } from 'recoil';

const REVERT_PUBLIC_KEY = 'pk_live_a87fee8c-28c7-494f-99a3-996ff89f9918';

export const SettingsCRMMigration = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb links={[{ children: 'Migrate' }]} />
          <SettingsReadDocumentationButton />
        </SettingsHeaderContainer>
        <Section>
          <RevertConnect
            config={{
              revertToken: REVERT_PUBLIC_KEY,
              tenantId: currentWorkspace?.id,
            }}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
