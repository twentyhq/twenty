import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Callout, ColorSchemePicker, MenuItem } from 'twenty-ui/components';
import { type ColorScheme } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const LabelOverrides = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('Light');

  return (
    <TwentyUiGalleryCard title="Label overrides">
      <Callout variant="info" title="Default notice" isClosable />
      <Callout
        variant="info"
        title="Supplied notice"
        isClosable
        closeLabel="Dismiss notice"
      />
      <ColorSchemePicker
        value={colorScheme}
        onChange={setColorScheme}
        lightLabel="Day appearance"
        darkLabel="Night appearance"
        systemLabel="Device appearance"
      />
      <Text role="status">Appearance: {colorScheme}</Text>
      <ListItem hotkeys={['G', 'D']}>Default shortcut</ListItem>
      <ListItem hotkeys={['G', 'S']} hotkeysJoinLabel="followed by">
        Supplied shortcut
      </ListItem>
      <MenuItem
        text="Legacy shortcut"
        hotKeys={['G', 'L']}
        hotKeysJoinLabel="next"
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
