import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLabContent } from '@/settings/lab/components/SettingsLabContent';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsLab = () => {
  return (
    <SubMenuTopBarContainer
      title="Lab"
      links={[
        {
          children: 'Other',
          href: getSettingsPath(SettingsPath.Lab),
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
