import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createHtmlElementClickStory } from '../../shared/test-utils/createHtmlElementStory';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../shared/test-utils/createFrontComponentStoryMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HTML/ElementCoverage/Click/Media',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Hr = createHtmlElementClickStory('hr');
export const Img = createHtmlElementClickStory('img');
export const Picture = createHtmlElementClickStory('picture');
export const Iframe = createHtmlElementClickStory('iframe');
