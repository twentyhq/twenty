import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createBaselineClickStory } from '../../test-utils/createBaselineStory';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/Baseline/Click/Interactive',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

export const Anchor = createBaselineClickStory('a');
export const Button = createBaselineClickStory('button');
export const Label = createBaselineClickStory('label');
export const Details = createBaselineClickStory('details');
export const Summary = createBaselineClickStory('summary');
export const Dialog = createBaselineClickStory('dialog');
