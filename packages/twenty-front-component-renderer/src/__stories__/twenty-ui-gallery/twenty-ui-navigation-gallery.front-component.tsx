import { Tag, ColorSample } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { defineFrontComponent } from 'twenty-sdk/define';
import { IconHome, IconUser } from 'twenty-ui/icon';
import {
  ClickToActionLink,
  ContactLink,
  GithubVersionLink,
  LinkType,
  MenuItem,
  MenuItemAvatar,
  MenuItemDraggable,
  MenuItemHotKeys,
  MenuItemLeftContent,
  MenuItemSuggestion,
  MenuPicker,
  NavigationBar,
  NavigationBarItem,
  RawLink,
  RoundedLink,
  SocialLink,
  StyledHoverableMenuItemBase,
  StyledMenuItemIconCheck,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
  UndecoratedLink,
  ListItem,
  DEFAULT_COLOR_LABELS,
} from 'twenty-ui/primitives/navigation';
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
    name: 'ContactLink',
    node: <ContactLink href="https://twenty.com">Contact</ContactLink>,
  },
  {
    name: 'GithubVersionLink',
    node: <GithubVersionLink version="v1.0.0" />,
  },
  {
    name: 'MenuItem',
    node: <MenuItem text="Menu item" LeftIcon={IconUser} />,
  },
  {
    name: 'MenuItemLeftContent',
    node: <MenuItemLeftContent text="Left content" LeftIcon={IconUser} />,
  },
  {
    name: 'StyledHoverableMenuItemBase',
    node: (
      <StyledHoverableMenuItemBase>Hoverable base</StyledHoverableMenuItemBase>
    ),
  },
  {
    name: 'StyledMenuItemIconCheck',
    node: <StyledMenuItemIconCheck size={16} />,
  },
  {
    name: 'StyledMenuItemLabel',
    node: <StyledMenuItemLabel>Label</StyledMenuItemLabel>,
  },
  {
    name: 'StyledMenuItemLeftContent',
    node: (
      <StyledMenuItemLeftContent>
        Left content wrapper
      </StyledMenuItemLeftContent>
    ),
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
    name: 'MenuItemHotKeys',
    node: <MenuItemHotKeys hotKeys={['⌘', 'K']} />,
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
    name: 'NavigationBarItem',
    node: (
      <NavigationBarItem
        Icon={IconHome}
        isActive={true}
        ariaLabel="Home"
        onClick={() => {}}
      />
    ),
  },
  // KNOWN ISSUE (TDD): RawLink and UndecoratedLink render a react-router Link
  // and crash because the sandbox provides no router context. Expected fix:
  // SDK-injected Router whose navigator bridges to the host navigate API.
  {
    name: 'RawLink',
    node: <RawLink href="/path">Raw link</RawLink>,
  },
  {
    name: 'RoundedLink',
    node: <RoundedLink href="https://twenty.com" label="Rounded link" />,
  },
  {
    name: 'SocialLink',
    node: (
      <SocialLink href="https://twitter.com/twenty" type={LinkType.Twitter} />
    ),
  },
  {
    name: 'UndecoratedLink',
    node: <UndecoratedLink to="/path">Undecorated link</UndecoratedLink>,
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
