import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createBaselineClickStory } from '../../test-utils/createBaselineStory';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/Baseline/Click/Svg',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

export const Svg = createBaselineClickStory('svg');
export const G = createBaselineClickStory('g');
export const Circle = createBaselineClickStory('circle');
export const Ellipse = createBaselineClickStory('ellipse');
export const Rect = createBaselineClickStory('rect');
export const Line = createBaselineClickStory('line');
export const Path = createBaselineClickStory('path');
export const Polygon = createBaselineClickStory('polygon');
export const Polyline = createBaselineClickStory('polyline');
