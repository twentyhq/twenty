import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryStory } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import { menuTest } from '@/__stories__/twenty-ui-gallery/utils/menuTest';
import { menuSelectionTest } from '@/__stories__/twenty-ui-gallery/utils/menuSelectionTest';
import { menuKeyboardTest } from '@/__stories__/twenty-ui-gallery/utils/menuKeyboardTest';
import { menuSubmenuTest } from '@/__stories__/twenty-ui-gallery/utils/menuSubmenuTest';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Twenty UI Menu',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const CompositionReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-menu',
  runtime: 'react',
  play: menuTest,
});

export const CompositionPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-menu',
  runtime: 'preact',
  play: menuTest,
});

export const SelectionReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-menu',
  runtime: 'react',
  play: menuSelectionTest,
});

export const SelectionPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-menu',
  runtime: 'preact',
  play: menuSelectionTest,
});

export const KeyboardReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-menu',
  runtime: 'react',
  play: menuKeyboardTest,
});

export const KeyboardPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-menu',
  runtime: 'preact',
  play: menuKeyboardTest,
});

export const SubmenuReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-menu',
  runtime: 'react',
  play: menuSubmenuTest,
});

export const SubmenuPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-menu',
  runtime: 'preact',
  play: menuSubmenuTest,
});
