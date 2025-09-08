import { ReactFlowProvider } from '@xyflow/react';

import { SettingsDataModelOverview } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverview';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const SettingsObjectOverview = () => {
  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: 'Objects', href: getSettingsPath(SettingsPath.Objects) },
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
