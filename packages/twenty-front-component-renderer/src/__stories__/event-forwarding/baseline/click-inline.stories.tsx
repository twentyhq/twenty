import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createBaselineClickStory } from '../../test-utils/createBaselineStory';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/Baseline/Click/Inline',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

export const Strong = createBaselineClickStory('strong');
export const Em = createBaselineClickStory('em');
export const Small = createBaselineClickStory('small');
export const Code = createBaselineClickStory('code');
export const B = createBaselineClickStory('b');
export const I = createBaselineClickStory('i');
export const U = createBaselineClickStory('u');
export const S = createBaselineClickStory('s');
export const Mark = createBaselineClickStory('mark');
export const Sub = createBaselineClickStory('sub');
export const Sup = createBaselineClickStory('sup');
export const Abbr = createBaselineClickStory('abbr');
export const Cite = createBaselineClickStory('cite');
export const Kbd = createBaselineClickStory('kbd');
export const Samp = createBaselineClickStory('samp');
export const Var = createBaselineClickStory('var');
export const Dfn = createBaselineClickStory('dfn');
export const Bdi = createBaselineClickStory('bdi');
export const Bdo = createBaselineClickStory('bdo');
export const Data = createBaselineClickStory('data');
export const Del = createBaselineClickStory('del');
export const Ins = createBaselineClickStory('ins');
export const Q = createBaselineClickStory('q');
export const Time = createBaselineClickStory('time');
