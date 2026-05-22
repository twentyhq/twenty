import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createHtmlElementClickStory } from '../../shared/test-utils/createHtmlElementStory';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../shared/test-utils/createFrontComponentStoryMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HTML/ElementCoverage/Click/Inline',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Strong = createHtmlElementClickStory('strong');
export const Em = createHtmlElementClickStory('em');
export const Small = createHtmlElementClickStory('small');
export const Code = createHtmlElementClickStory('code');
export const B = createHtmlElementClickStory('b');
export const I = createHtmlElementClickStory('i');
export const U = createHtmlElementClickStory('u');
export const S = createHtmlElementClickStory('s');
export const Mark = createHtmlElementClickStory('mark');
export const Sub = createHtmlElementClickStory('sub');
export const Sup = createHtmlElementClickStory('sup');
export const Abbr = createHtmlElementClickStory('abbr');
export const Cite = createHtmlElementClickStory('cite');
export const Kbd = createHtmlElementClickStory('kbd');
export const Samp = createHtmlElementClickStory('samp');
export const Var = createHtmlElementClickStory('var');
export const Dfn = createHtmlElementClickStory('dfn');
export const Bdi = createHtmlElementClickStory('bdi');
export const Bdo = createHtmlElementClickStory('bdo');
export const Data = createHtmlElementClickStory('data');
export const Del = createHtmlElementClickStory('del');
export const Ins = createHtmlElementClickStory('ins');
export const Q = createHtmlElementClickStory('q');
export const Time = createHtmlElementClickStory('time');
