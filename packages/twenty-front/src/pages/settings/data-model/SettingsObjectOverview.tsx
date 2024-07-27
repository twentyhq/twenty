import { ReactFlowProvider } from 'reactflow';
import { IconSettings } from 'twenty-ui';

import { SettingsDataModelOverview } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverview';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';

export const SettingsObjectOverview = () => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <ReactFlowProvider>
        <SettingsDataModelOverview />
      </ReactFlowProvider>
    </SubMenuTopBarContainer>
  );
};
