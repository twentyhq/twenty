import { defineFrontComponent } from 'twenty-sdk/define';
import {
  DEFAULT_COLOR_LABELS,
  MenuItem,
  MenuItemAvatar,
  MenuItemDraggable,
  MenuItemSuggestion,
  MenuPicker,
  NavigationBar,
  RoundedLink,
} from 'twenty-ui/components';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { IconHome, IconUser } from 'twenty-ui/icon';
import { ColorSample, Tag } from 'twenty-ui/primitives/data-display';
import { ClickToActionLink, ListItem } from 'twenty-ui/primitives/navigation';
import { ThemeProvider } from 'twenty-ui/theme';
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
    name: 'ListItem multiple selection',
    node: (
      <ListItem
        className=""
        role="option"
        aria-selected={false}
        selected={false}
        indicator="checkbox"
        onClick={() => {}}
      >
        <OverflowingTextWithTooltip text={'Multi select'} />
      </ListItem>
    ),
  },
  {
    name: 'ListItem multiple avatar selection',
    node: (
      <ListItem
        role="option"
        aria-selected={true}
        selected={true}
        indicator="checkbox"
        onClick={() => {}}
      >
        <OverflowingTextWithTooltip text={'Multi avatar'} />
      </ListItem>
    ),
  },
  {
    name: 'ListItem multiple tag selection',
    node: (
      <ListItem
        onClick={() => {}}
        role="option"
        aria-selected={false}
        selected={false}
        indicator="checkbox"
      >
        <Tag color={'blue'}>{'Tag'}</Tag>
      </ListItem>
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
    name: 'ListItem selection',
    node: (
      <ListItem
        onClick={() => {}}
        role="option"
        aria-selected={true}
        selected={true}
        indicator="check"
      >
        <OverflowingTextWithTooltip text={'Select'} />
      </ListItem>
    ),
  },
  {
    name: 'ListItem avatar selection',
    node: (
      <ListItem
        onClick={() => {}}
        role="option"
        aria-selected={true}
        selected={true}
        indicator="check"
      >
        <OverflowingTextWithTooltip text={'Select avatar'} />
      </ListItem>
    ),
  },
  {
    name: 'ListItem color selection',
    node: (
      <ListItem
        onClick={() => {}}
        role="option"
        aria-selected={true}
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
      <ListItem
        onClick={() => {}}
        role="option"
        aria-selected={true}
        selected={true}
        indicator="check"
      >
        <Tag color={'blue'} borderStyle="dashed" variant={'soft'}>
          {'Select tag'}
        </Tag>
      </ListItem>
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
