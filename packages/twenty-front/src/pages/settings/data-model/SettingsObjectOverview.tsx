import { ReactFlowProvider } from 'reactflow';

import { SettingsDataModelOverview } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverview';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { IconHierarchy2 } from 'twenty-ui';

export const SettingsObjectOverview = () => {
  return (
    <SubMenuTopBarContainer
      Icon={IconHierarchy2}
      title={
        <Breadcrumb
          links={[
            { children: 'Data model', href: '/settings/objects' },
            {
              children: 'Overview',
            },
          ]}
        />
      }
    >
      <ReactFlowProvider>
        <SettingsDataModelOverview />
      </ReactFlowProvider>
    </SubMenuTopBarContainer>
  );
};
