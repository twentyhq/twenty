import { defineFrontComponent } from 'twenty-sdk/define';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';
import { TabButtonContractsExample } from '@/__stories__/twenty-ui-gallery/tab-button-contracts-example';
import { TabsContractsExample } from '@/__stories__/twenty-ui-gallery/tabs-contracts-example';

const TabsExample = () => (
  <TwentyUiGalleryCard title="Tabs">
    <TabsContractsExample />
    <TabButtonContractsExample />
  </TwentyUiGalleryCard>
);

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840004',
  name: 'twenty-ui-tabs',
  description: 'Tabs panels, keyboard selection, and route or action controls',
  component: TabsExample,
});
