import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createBaselineClickStory } from '../../test-utils/createBaselineStory';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/Baseline/Click/Table',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

export const Table = createBaselineClickStory('table');
export const Thead = createBaselineClickStory('thead');
export const Tbody = createBaselineClickStory('tbody');
export const Tfoot = createBaselineClickStory('tfoot');
export const Tr = createBaselineClickStory('tr');
export const Th = createBaselineClickStory('th');
export const Td = createBaselineClickStory('td');
export const Caption = createBaselineClickStory('caption');
export const Colgroup = createBaselineClickStory('colgroup');
