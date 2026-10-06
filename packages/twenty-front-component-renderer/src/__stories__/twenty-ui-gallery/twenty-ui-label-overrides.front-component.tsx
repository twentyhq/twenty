import { defineFrontComponent } from 'twenty-sdk/define';
import { Callout } from 'twenty-ui/components/feedback';
import { MenuItem } from 'twenty-ui/components/navigation';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const LabelOverrides = () => {
  return (
    <TwentyUiGalleryCard title="Label overrides">
      <Callout variant="info" title="Default notice" isClosable />
      <Callout
        variant="info"
        title="Supplied notice"
        isClosable
        closeLabel="Dismiss notice"
      />
      <ListItem shortcut={[['G'], ['D']]}>Default shortcut</ListItem>
      <ListItem shortcut={[['G'], ['S']]} shortcutJoinLabel="followed by">
        Supplied shortcut
      </ListItem>
      <MenuItem
        text="Legacy shortcut"
        shortcut={[['G'], ['L']]}
        shortcutJoinLabel="next"
      />
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '5fbc0790-28ac-4d43-9e43-ea246f0da4da',
  name: 'twenty-ui-label-overrides',
  description:
    'Caller-owned text and accessible names in both renderer runtimes',
  component: LabelOverrides,
});
