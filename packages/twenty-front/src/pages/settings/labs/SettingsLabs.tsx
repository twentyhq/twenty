import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLabsContent } from '@/settings/labs/components/SettingsLabsContent';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

export const SettingsLabs = () => {
  return (
    <SubMenuTopBarContainer
      title="Labs"
      links={[
        {
          children: 'Other',
          href: getSettingsPagePath(SettingsPath.AdminPanel),
        },
        { children: 'Labs' },
      ]}
    >
      <SettingsPageContainer>
        <SettingsLabsContent />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
