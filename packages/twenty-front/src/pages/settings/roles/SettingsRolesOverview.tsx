
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

export const SettingsRolesOverview = () => {
  return (
    <SubMenuTopBarContainer 
        links={[
            {
                children: 'New',
                href: getSettingsPagePath(SettingsPath.NewRole),
            },
        ]}  
        title="Settings"
    >
        <></>
    </SubMenuTopBarContainer>
  );
};