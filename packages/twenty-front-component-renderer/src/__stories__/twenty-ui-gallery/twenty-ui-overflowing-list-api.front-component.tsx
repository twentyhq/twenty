import { defineFrontComponent } from 'twenty-sdk/define';

import { TwentyUiGalleryCard } from '../shared/front-components/twenty-ui-gallery-card';
import { OverflowingListApiExample } from './components/OverflowingListApiExample';

const OverflowingListApi = () => (
  <TwentyUiGalleryCard title="Overflowing list API">
    <OverflowingListApiExample />
  </TwentyUiGalleryCard>
);

export default defineFrontComponent({
  universalIdentifier: '652141f6-6f4f-4f7b-9333-8c71b2f0b84e',
  name: 'twenty-ui-overflowing-list-api',
  description: 'Controlled popup state, native composition and caller events',
  component: OverflowingListApi,
});
