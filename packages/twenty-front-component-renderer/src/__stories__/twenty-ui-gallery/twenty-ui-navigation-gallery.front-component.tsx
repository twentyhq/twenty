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
  MenuItemMultiSelect,
  MenuItemMultiSelectAvatar,
  MenuItemMultiSelectTag,
  MenuItemNavigate,
  MenuItemSelect,
  MenuItemSelectAvatar,
  MenuItemSelectColor,
  MenuItemSelectTag,
  MenuItemSuggestion,
  MenuItemToggle,
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
  StyledMenuItemSelect,
  UndecoratedLink,
} from 'twenty-ui/navigation';
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
    name: 'MenuItemNavigate',
    node: (
      <MenuItemNavigate
        text="Navigate"
        LeftIcon={IconUser}
        onClick={() => {}}
      />
    ),
  },
  {
    name: 'StyledMenuItemSelect',
    node: <StyledMenuItemSelect>Select base</StyledMenuItemSelect>,
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
    name: 'MenuItemToggle',
    node: (
      <MenuItemToggle text="Toggle" toggled={true} onToggleChange={() => {}} />
    ),
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
      title="twenty-ui/navigation"
      entries={NAVIGATION_ENTRIES}
    />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000108',
  name: 'twenty-ui-navigation-gallery',
  description: 'Renders every twenty-ui/navigation component in the sandbox',
  component: NavigationGallery,
});
