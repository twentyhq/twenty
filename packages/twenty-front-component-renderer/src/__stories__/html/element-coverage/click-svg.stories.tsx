import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createHtmlElementClickStory } from '../../shared/test-utils/createHtmlElementStory';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../shared/test-utils/createFrontComponentStoryMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HTML/ElementCoverage/Click/Svg',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Svg = createHtmlElementClickStory('svg');
export const G = createHtmlElementClickStory('g');
export const Circle = createHtmlElementClickStory('circle');
export const Ellipse = createHtmlElementClickStory('ellipse');
export const Rect = createHtmlElementClickStory('rect');
export const Line = createHtmlElementClickStory('line');
export const Path = createHtmlElementClickStory('path');
export const Polygon = createHtmlElementClickStory('polygon');
export const Polyline = createHtmlElementClickStory('polyline');
