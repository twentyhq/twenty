import { defineFrontComponent } from 'twenty-sdk/define';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { ThemeProvider } from 'twenty-ui/theme';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';
import { ListItemOwnerExample } from '@/__stories__/twenty-ui-gallery/list-item-owner-example';
import { ListItemPopupOwnerExample } from '@/__stories__/twenty-ui-gallery/list-item-popup-owner-example';
import { ListItemPresentationExample } from '@/__stories__/twenty-ui-gallery/list-item-presentation-example';

const OVERFLOW_ROW_STYLE = { width: 160 };

const ListItemExample = () => (
  <TwentyUiGalleryCard title="ListItem">
    <ListItemOwnerExample />
    <ListItemPresentationExample />
    <ListItemPopupOwnerExample />
    <ThemeProvider colorScheme="light" applyToRoot={false}>
      <ListItem style={OVERFLOW_ROW_STYLE}>
        A long workspace preference that overflows its row
      </ListItem>
    </ThemeProvider>
  </TwentyUiGalleryCard>
);

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840003',
  name: 'twenty-ui-list-item',
  description: 'Presentational ListItem rows with explicit native owners',
  component: ListItemExample,
});
