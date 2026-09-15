import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import {
  createHtmlTagClickStory,
  createHtmlTagFocusStory,
  createHtmlTagPointerStory,
} from '@/__stories__/shared/test-utils/createHtmlElementStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Svg/Svg/Events',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Click = createHtmlTagClickStory({
  frontComponentBundleName: 'svg-click',
});

export const FocusBlur = createHtmlTagFocusStory({
  frontComponentBundleName: 'svg-focus-blur',
});

export const Pointer = createHtmlTagPointerStory({
  frontComponentBundleName: 'svg-pointer',
});
