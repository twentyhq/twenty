import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createBaselineClickStory } from '../../test-utils/createBaselineStory';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/Baseline/Click/List',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

export const Ul = createBaselineClickStory('ul');
export const Ol = createBaselineClickStory('ol');
export const Li = createBaselineClickStory('li');
export const Dl = createBaselineClickStory('dl');
export const Dt = createBaselineClickStory('dt');
export const Dd = createBaselineClickStory('dd');
export const Figure = createBaselineClickStory('figure');
export const Figcaption = createBaselineClickStory('figcaption');
export const Ruby = createBaselineClickStory('ruby');
export const Rt = createBaselineClickStory('rt');
export const Rp = createBaselineClickStory('rp');
