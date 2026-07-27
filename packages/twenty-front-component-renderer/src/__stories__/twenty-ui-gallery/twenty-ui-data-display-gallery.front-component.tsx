import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AnimatedCheckmark,
  Avatar,
  AvatarGroup,
  AvatarOrIcon,
  Checkmark,
  Chip,
  ColorSample,
  CommandBlock,
  LinkChip,
  NotificationCounter,
  Pill,
  Status,
  StyledTintedIconTileContainer,
  Tag,
  TintedIconTile,
} from 'twenty-ui/data-display';
import { IconStar } from 'twenty-ui/icon';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const DATA_DISPLAY_ENTRIES: GalleryEntry[] = [
  {
    name: 'AnimatedCheckmark',
    node: <AnimatedCheckmark isAnimating size={28} />,
  },
  {
    name: 'Avatar',
    node: <Avatar placeholder="John Doe" size="md" type="rounded" />,
  },
  {
    name: 'AvatarGroup',
    node: (
      <AvatarGroup
        avatars={[
          <Avatar key="a" placeholder="Alice" />,
          <Avatar key="b" placeholder="Bob" />,
        ]}
      />
    ),
  },
  {
    name: 'AvatarOrIcon',
    node: <AvatarOrIcon placeholder="Jane" Icon={IconStar} />,
  },
  {
    name: 'Checkmark',
    node: <Checkmark />,
  },
  {
    name: 'Chip',
    node: <Chip label="Chip label" />,
  },
  {
    name: 'ColorSample',
    node: <ColorSample colorName="blue" />,
  },
  {
    name: 'CommandBlock',
    node: <CommandBlock commands={['npm install', 'npm run start']} />,
  },
  // KNOWN ISSUE (TDD): LinkChip renders a react-router Link and crashes
  // because the sandbox provides no router context. Expected fix: SDK-injected
  // Router whose navigator bridges to the host navigate API.
  {
    name: 'LinkChip',
    node: <LinkChip to="/example" label="Link chip" />,
  },
  {
    name: 'NotificationCounter',
    node: <NotificationCounter count={3} />,
  },
  {
    name: 'Pill',
    node: <Pill label="Pill" Icon={IconStar} />,
  },
  {
    name: 'Status',
    node: <Status color="green" text="Active" />,
  },
  {
    name: 'StyledTintedIconTileContainer',
    node: (
      <StyledTintedIconTileContainer $dimension="32px">
        <IconStar size={16} />
      </StyledTintedIconTileContainer>
    ),
  },
  {
    name: 'Tag',
    node: <Tag color="blue" text="Tag" />,
  },
  {
    name: 'TintedIconTile',
    node: <TintedIconTile Icon={IconStar} />,
  },
];

const DataDisplayGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery
      title="twenty-ui/data-display"
      entries={DATA_DISPLAY_ENTRIES}
    />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000101',
  name: 'twenty-ui-data-display-gallery',
  description: 'Renders every twenty-ui/data-display component in the sandbox',
  component: DataDisplayGallery,
});
