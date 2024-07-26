import { ReactFlowProvider } from 'reactflow';
import { IconSettings } from 'twenty-ui';

import { InformationBanner } from '@/information-banner/InformationBanner';
import { SettingsDataModelOverview } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverview';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';

export const SettingsObjectOverview = () => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <InformationBanner />
      <ReactFlowProvider>
        <SettingsDataModelOverview />
      </ReactFlowProvider>
    </SubMenuTopBarContainer>
  );
};
