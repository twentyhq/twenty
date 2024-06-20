import React from 'react';
import { RevertConnect } from '@revertdotdev/revert-react';
import { IconSettings } from 'twenty-ui';

import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsCRMMigration = () => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb links={[{ children: 'Migrate' }]} />
          <SettingsReadDocumentationButton />
        </SettingsHeaderContainer>
        <Section>
          test
          <RevertConnect
            config={{
              revertToken: 'pk_test_73db8636-2d3e-4ead-ac43-1bfa288c09f2',
              tenantId:
                'sfdc_acc_8a24c1b6-a8fe-4feb-9a8d-27562783d37a_development',
            }}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
