import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  DEFAULT_COLOR_LABELS,
  ListItemButton,
} from 'twenty-ui/components/navigation';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { IconGripVertical, IconHome, IconUser } from 'twenty-ui/icon';
import { Avatar, ColorSample, Tag } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { Breadcrumb, ListItem } from 'twenty-ui/primitives/navigation';
import { ThemeProvider } from 'twenty-ui/theme';
import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const NAVIGATION_ENTRIES: GalleryEntry[] = [
  {
    name: 'Breadcrumb',
    node: (
      <Breadcrumb
        aria-label="Workspace breadcrumb"
        links={[
          { children: 'Workspace', href: '/workspace' },
          { children: 'Settings' },
        ]}
      />
    ),
  },
  {
    name: 'ListItem icon row',
    node: <ListItem startIcon={<IconUser />}>Menu item</ListItem>,
  },
  {
    name: 'ListItem avatar row',
    node: (
      <ListItem
        startIcon={
          <Avatar name="Avatar item" size="md" shape="rounded-square" />
        }
      >
        Avatar item
      </ListItem>
    ),
  },
  {
    name: 'Draggable row presentation',
    node: (
      <ListItem
        startIcon={
          <>
            <IconGripVertical />
            <IconUser />
          </>
        }
      >
        Draggable
      </ListItem>
    ),
  },
  {
    name: 'ListItem multiple selection',
    node: (
      <ListItem className="" selected={false} indicator="checkbox">
        <OverflowingTextWithTooltip text={'Multi select'} />
      </ListItem>
    ),
  },
  {
    name: 'ListItem multiple avatar selection',
    node: (
      <ListItem selected={true} indicator="checkbox">
        <OverflowingTextWithTooltip text={'Multi avatar'} />
      </ListItem>
    ),
  },
  {
    name: 'ListItem multiple tag selection',
    node: (
      <ListItem selected={false} indicator="checkbox">
        <Tag color={'blue'}>{'Tag'}</Tag>
      </ListItem>
    ),
  },
  {
    name: 'ListItem navigation',
    node: (
      <ListItem
        startIcon={<IconUser />}
        render={<button type="button" />}
        hasSubmenu
      >
        Navigate
      </ListItem>
    ),
  },
  {
    name: 'ListItem selection',
    node: (
      <ListItem selected={true} indicator="check">
        <OverflowingTextWithTooltip text={'Select'} />
      </ListItem>
    ),
  },
  {
    name: 'ListItem avatar selection',
    node: (
      <ListItem selected={true} indicator="check">
        <OverflowingTextWithTooltip text={'Select avatar'} />
      </ListItem>
    ),
  },
  {
    name: 'ListItem color selection',
    node: (
      <ListItem
        selected={true}
        indicator="check"
        startIcon={<ColorSample colorName={'blue'} />}
      >
        <OverflowingTextWithTooltip text={DEFAULT_COLOR_LABELS['blue']} />
      </ListItem>
    ),
  },
  {
    name: 'ListItem tag selection',
    node: (
      <ListItem selected={true} indicator="check">
        <Tag color={'blue'} borderStyle="dashed" variant={'soft'}>
          {'Select tag'}
        </Tag>
      </ListItem>
    ),
  },
];

const NavigationGallery = () => {
  const [suggestionActivations, setSuggestionActivations] = useState(0);
  const [pickerActivations, setPickerActivations] = useState(0);
  const [isPickerSelected, setIsPickerSelected] = useState(false);

  return (
    <ThemeProvider colorScheme="light">
      <ComponentGallery
        title="twenty-ui/primitives/navigation"
        entries={[
          ...NAVIGATION_ENTRIES,
          {
            name: 'Suggestion action',
            node: (
              <ListItemButton
                selected
                startIcon={<IconUser />}
                onClick={() => setSuggestionActivations((count) => count + 1)}
              >
                Suggestion
              </ListItemButton>
            ),
          },
          {
            name: 'Picker toggle',
            node: (
              <Button
                startIcon={<IconHome />}
                aria-pressed={isPickerSelected}
                onClick={() => {
                  setIsPickerSelected((selected) => !selected);
                  setPickerActivations((count) => count + 1);
                }}
              >
                Picker
              </Button>
            ),
          },
          {
            name: 'Disabled picker toggle',
            node: (
              <Button
                disabled
                aria-pressed={false}
                onClick={() => setPickerActivations((count) => count + 1)}
              >
                Disabled picker
              </Button>
            ),
          },
        ]}
      />
      <output aria-label="Suggestion activations">
        {suggestionActivations}
      </output>
      <output aria-label="Picker activations">{pickerActivations}</output>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000108',
  name: 'twenty-ui-navigation-gallery',
  description:
    'Renders every twenty-ui/primitives/navigation component in the sandbox',
  component: NavigationGallery,
});
