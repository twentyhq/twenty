import { ReactFlowProvider } from 'reactflow';

import { SettingsDataModelOverview } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverview';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { IconHierarchy2 } from 'twenty-ui';

export const SettingsObjectOverview = () => {
  return (
    <SubMenuTopBarContainer
      Icon={IconHierarchy2}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Objects', href: '/settings/objects' },
        {
          children: 'Overview',
        },
      ]}
    >
      <ReactFlowProvider>
        <SettingsDataModelOverview />
      </ReactFlowProvider>
    </SubMenuTopBarContainer>
  );
};
