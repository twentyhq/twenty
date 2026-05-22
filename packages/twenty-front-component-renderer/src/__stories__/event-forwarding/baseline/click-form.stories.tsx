import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createBaselineClickStory } from '../../test-utils/createBaselineStory';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/Baseline/Click/Form',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

export const Form = createBaselineClickStory('form');
export const Fieldset = createBaselineClickStory('fieldset');
export const Legend = createBaselineClickStory('legend');
export const Output = createBaselineClickStory('output');
export const Progress = createBaselineClickStory('progress');
export const Meter = createBaselineClickStory('meter');
export const Option = createBaselineClickStory('option');
export const Optgroup = createBaselineClickStory('optgroup');
export const Datalist = createBaselineClickStory('datalist');
