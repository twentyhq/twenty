
import { SettingsDataRoleOverview } from '@/settings/roles/graph-overview/SettingsDataRoleOverview';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ReactFlowProvider } from '@xyflow/react';

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
      <ReactFlowProvider>
        <SettingsDataRoleOverview />
      </ReactFlowProvider>
    </SubMenuTopBarContainer>
  );
};