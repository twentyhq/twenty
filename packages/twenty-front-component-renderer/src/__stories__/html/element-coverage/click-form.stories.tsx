import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createHtmlElementClickStory } from '../../shared/test-utils/createHtmlElementStory';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../shared/test-utils/createFrontComponentStoryMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HTML/ElementCoverage/Click/Form',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Form = createHtmlElementClickStory('form');
export const Fieldset = createHtmlElementClickStory('fieldset');
export const Legend = createHtmlElementClickStory('legend');
export const Output = createHtmlElementClickStory('output');
export const Progress = createHtmlElementClickStory('progress');
export const Meter = createHtmlElementClickStory('meter');
export const Option = createHtmlElementClickStory('option');
export const Optgroup = createHtmlElementClickStory('optgroup');
export const Datalist = createHtmlElementClickStory('datalist');
