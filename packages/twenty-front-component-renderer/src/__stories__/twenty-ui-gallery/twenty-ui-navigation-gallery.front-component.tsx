import { defineFrontComponent } from 'twenty-sdk/define';
import {
  MenuItem,
  MenuItemAvatar,
  MenuItemDraggable,
  MenuItemMultiSelect,
  MenuItemMultiSelectAvatar,
  MenuItemMultiSelectTag,
  MenuItemSelect,
  MenuItemSelectAvatar,
  MenuItemSelectColor,
  MenuItemSelectTag,
  MenuItemSuggestion,
  MenuPicker,
  NavigationBar,
  RoundedLink,
} from 'twenty-ui/components';
import { IconHome, IconUser } from 'twenty-ui/icon';
import { ClickToActionLink, ListItem } from 'twenty-ui/primitives/navigation';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const NAVIGATION_ENTRIES: GalleryEntry[] = [
  {
    name: 'ClickToActionLink',
    node: <ClickToActionLink href="#">Click me</ClickToActionLink>,
  },
  {
    name: 'MenuItem',
    node: <MenuItem text="Menu item" LeftIcon={IconUser} />,
  },
  {
    name: 'MenuItemAvatar',
    node: <MenuItemAvatar text="Avatar item" />,
  },
  {
    name: 'MenuItemDraggable',
    node: (
      <MenuItemDraggable
        text="Draggable"
        LeftIcon={IconUser}
        gripMode="always"
      />
    ),
  },
  {
    name: 'MenuItemMultiSelect',
    node: (
      <MenuItemMultiSelect
        text="Multi select"
        selected={false}
        className=""
        onSelectChange={() => {}}
      />
    ),
  },
  {
    name: 'MenuItemMultiSelectAvatar',
    node: (
      <MenuItemMultiSelectAvatar
        text="Multi avatar"
        selected={true}
        onSelectChange={() => {}}
      />
    ),
  },
  {
    name: 'MenuItemMultiSelectTag',
    node: (
      <MenuItemMultiSelectTag
        text="Tag"
        color="blue"
        selected={false}
        onClick={() => {}}
      />
    ),
  },
  {
    name: 'ListItem navigation',
    node: (
      <ListItem
        startIcon={<IconUser />}
        onClick={() => {}}
        render={<button type="button" />}
        hasSubmenu
      >
        Navigate
      </ListItem>
    ),
  },
  {
    name: 'MenuItemSelect',
    node: <MenuItemSelect text="Select" selected={true} onClick={() => {}} />,
  },
  {
    name: 'MenuItemSelectAvatar',
    node: (
      <MenuItemSelectAvatar
        text="Select avatar"
        selected={true}
        onClick={() => {}}
      />
    ),
  },
  {
    name: 'MenuItemSelectColor',
    node: (
      <MenuItemSelectColor color="blue" selected={true} onClick={() => {}} />
    ),
  },
  {
    name: 'MenuItemSelectTag',
    node: (
      <MenuItemSelectTag
        color="blue"
        text="Select tag"
        selected={true}
        onClick={() => {}}
      />
    ),
  },
  {
    name: 'MenuItemSuggestion',
    node: <MenuItemSuggestion text="Suggestion" onClick={() => {}} />,
  },
  {
    name: 'MenuPicker',
    node: <MenuPicker id="picker-1" icon={IconHome} label="Picker" />,
  },
  {
    name: 'NavigationBar',
    node: (
      <NavigationBar
        activeItemName="home"
        items={[
          { name: 'home', label: 'Home', Icon: IconHome, onClick: () => {} },
        ]}
      />
    ),
  },
  {
    name: 'RoundedLink',
    node: <RoundedLink href="https://twenty.com" label="Rounded link" />,
  },
];

const NavigationGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery
      title="twenty-ui/primitives/navigation"
      entries={NAVIGATION_ENTRIES}
    />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000108',
  name: 'twenty-ui-navigation-gallery',
  description:
    'Renders every twenty-ui/primitives/navigation component in the sandbox',
  component: NavigationGallery,
});
