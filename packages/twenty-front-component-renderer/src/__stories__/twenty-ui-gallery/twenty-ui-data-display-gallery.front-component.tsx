import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AvatarGroup,
  CommandBlock,
  NotificationCounter,
  TintedIconTile,
} from 'twenty-ui/components';
import { IconStar } from 'twenty-ui/icon';
import {
  Avatar,
  Chip,
  ColorSample,
  Pill,
  Status,
  Tag,
} from 'twenty-ui/primitives/data-display';
import { ThemeProvider } from 'twenty-ui/theme';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const DATA_DISPLAY_ENTRIES: GalleryEntry[] = [
  {
    name: 'Avatar',
    node: <Avatar name="John Doe" size="md" shape="circle" />,
  },
  {
    name: 'AvatarGroup',
    node: (
      <AvatarGroup
        avatars={[
          <Avatar key="a" name="Alice" />,
          <Avatar key="b" name="Bob" />,
        ]}
      />
    ),
  },
  {
    name: 'Chip',
    node: <Chip>Chip label</Chip>,
  },
  {
    name: 'ColorSample',
    node: <ColorSample colorName="blue" />,
  },
  {
    name: 'CommandBlock',
    node: <CommandBlock commands={['npm install', 'npm run start']} />,
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
    node: <Status color="green">Active</Status>,
  },
  {
    name: 'Tag',
    node: <Tag color="blue">Tag</Tag>,
  },
  {
    name: 'TintedIconTile',
    node: <TintedIconTile Icon={IconStar} />,
  },
];

const DataDisplayGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery
      title="twenty-ui/primitives/data-display"
      entries={DATA_DISPLAY_ENTRIES}
    />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000101',
  name: 'twenty-ui-data-display-gallery',
  description:
    'Renders every twenty-ui/primitives/data-display component in the sandbox',
  component: DataDisplayGallery,
});
