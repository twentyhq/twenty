import { type Meta, type StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';
import { expectEventLogged } from '../../test-utils/matchers/expectEventLogged';
import { expectProbeReady } from '../../test-utils/matchers/expectProbeReady';
import { expectSubjectState } from '../../test-utils/matchers/expectSubjectState';
import { runProbeStory } from '../../test-utils/runProbeStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/Form/Button',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const ClickEvent: Story = runProbeStory({
  probe: 'form-controls',
  scenarioId: 'form-controls:button:click',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectProbeReady(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await expectSubjectState({ canvas, expected: '1' });

    await userEvent.click(subject);
    await expectSubjectState({ canvas, expected: '2' });

    await expectEventLogged({ canvas, matcher: { type: 'click' } });
  },
});
