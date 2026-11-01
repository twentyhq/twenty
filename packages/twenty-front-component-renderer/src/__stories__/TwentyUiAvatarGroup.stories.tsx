import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryStory as Story } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { avatarGroupTest } from '@/__stories__/twenty-ui-gallery/utils/avatarGroupTest';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Twenty UI AvatarGroup',
  component: FrontComponentRenderer,
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const AvatarGroupReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-avatar-group',
  runtime: 'react',
  play: avatarGroupTest,
});

export const AvatarGroupPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-avatar-group',
  runtime: 'preact',
  play: avatarGroupTest,
});
