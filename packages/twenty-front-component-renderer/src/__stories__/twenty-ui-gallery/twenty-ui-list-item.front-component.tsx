import { createElement, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';
import { ThemeProvider } from 'twenty-ui/theme';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const OVERFLOW_ROW_STYLE = { width: 160 };

const ListItemExample = () => {
  const [selected, setSelected] = useState(false);
  const [opened, setOpened] = useState(false);

  return (
    <TwentyUiGalleryCard title="ListItem">
      <ListItem
        selected={selected}
        indicator="check"
        onClick={() => setSelected(!selected)}
        description="Workspace preference"
      >
        Weekly digest
      </ListItem>
      <ListItem disabled role="button" onClick={() => setSelected(true)}>
        Disabled preference
      </ListItem>
      <ListItem
        render={(renderProps) =>
          createElement('button', { ...renderProps, type: 'button' })
        }
        hasSubmenu
        onClick={() => setOpened(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpened(false);
          }
        }}
      >
        Hidden fields
      </ListItem>
      <ThemeProvider colorScheme="light" applyToRoot={false}>
        <ListItem style={OVERFLOW_ROW_STYLE}>
          A long workspace preference that overflows its row
        </ListItem>
      </ThemeProvider>
      <Text>Fields: {opened ? 'open' : 'closed'}</Text>
      <Text role="status">Digest: {selected ? 'enabled' : 'disabled'}</Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840003',
  name: 'twenty-ui-list-item',
  description: 'ListItem selection and disabled behavior in the sandbox',
  component: ListItemExample,
});
