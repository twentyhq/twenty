import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLabContent } from '@/settings/lab/components/SettingsLabContent';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

export const SettingsLab = () => {
  return (
    <SubMenuTopBarContainer
      title="Lab"
      links={[
        {
          children: 'Other',
          href: getSettingsPagePath(SettingsPath.Lab),
        },
        { children: 'Lab' },
      ]}
    >
      <SettingsPageContainer>
        <SettingsLabContent />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
