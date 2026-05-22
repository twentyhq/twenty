import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../../host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../../shared/test-utils/createFrontComponentStoryMeta';
import {
  createHtmlTagClickStory,
  createHtmlTagFocusStory,
} from '../../../shared/test-utils/createHtmlElementStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Sectioning/Article/Events',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Click = createHtmlTagClickStory({
  frontComponentBundleName: 'article',
  tag: 'article',
});

export const FocusBlur = createHtmlTagFocusStory({
  frontComponentBundleName: 'article',
  tag: 'article',
});
