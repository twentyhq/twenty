import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createHtmlElementClickStory } from '../../shared/test-utils/createHtmlElementStory';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../shared/test-utils/createFrontComponentStoryMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HTML/ElementCoverage/Click/List',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Ul = createHtmlElementClickStory('ul');
export const Ol = createHtmlElementClickStory('ol');
export const Li = createHtmlElementClickStory('li');
export const Dl = createHtmlElementClickStory('dl');
export const Dt = createHtmlElementClickStory('dt');
export const Dd = createHtmlElementClickStory('dd');
export const Figure = createHtmlElementClickStory('figure');
export const Figcaption = createHtmlElementClickStory('figcaption');
export const Ruby = createHtmlElementClickStory('ruby');
export const Rt = createHtmlElementClickStory('rt');
export const Rp = createHtmlElementClickStory('rp');
