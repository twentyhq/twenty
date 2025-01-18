import { ReactFlowProvider } from '@xyflow/react';

import { SettingsDataModelOverview } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverview';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { settingsLink } from '~/utils/navigation/settingsLink';

export const SettingsObjectOverview = () => {
  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: 'Workspace',
          href: settingsLink(SettingsPath.Workspace),
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
