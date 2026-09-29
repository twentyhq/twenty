import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryStory as Story } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import { labelOverridesTest } from '@/__stories__/twenty-ui-gallery/utils/labelOverridesTest';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Label overrides',
  component: FrontComponentRenderer,
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const React: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-label-overrides',
  runtime: 'react',
  play: labelOverridesTest,
});

export const Preact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-label-overrides',
  runtime: 'preact',
  play: labelOverridesTest,
});
