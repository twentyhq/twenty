import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import { responsiveHooksTest } from '@/__stories__/twenty-ui-gallery/utils/responsiveHooksTest';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Responsive Hooks',
  component: FrontComponentRenderer,
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const React = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-responsive-hooks',
  runtime: 'react',
  play: responsiveHooksTest,
});

export const Preact = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-responsive-hooks',
  runtime: 'preact',
  play: responsiveHooksTest,
});
