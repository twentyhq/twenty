
import { SettingsDataRoleOverview } from '@/settings/roles/graph-overview/SettingsDataRoleOverview';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ReactFlowProvider } from '@xyflow/react';
import { useTranslation } from 'react-i18next';

export const SettingsRolesOverview = () => {
  const { t } = useTranslation();
  return (
    <SubMenuTopBarContainer 
    links={[
      {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
      },
      {
        children: 'Roles',
        href: getSettingsPagePath(SettingsPath.MembersRoles),
      },
      ]} 
      title={""}
    >
      <ReactFlowProvider>
        <SettingsDataRoleOverview />
      </ReactFlowProvider>
    </SubMenuTopBarContainer>
  );
};