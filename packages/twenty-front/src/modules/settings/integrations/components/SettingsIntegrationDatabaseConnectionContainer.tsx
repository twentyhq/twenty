import { ReactNode } from 'react';
import { IconSettings } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';

// TO DELETE ?
export const SettingsIntegrationDatabaseConnectionContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>{children}</SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
