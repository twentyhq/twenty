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
import { TYPING_DELAY } from '../../test-utils/probe-timeouts';
import { runProbeStory } from '../../test-utils/runProbeStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/Form/Input',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const TextValueRoundTrip: Story = runProbeStory({
  probe: 'form-controls',
  scenarioId: 'form-controls:input.text:value',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectProbeReady(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.type(subject, 'hello', { delay: TYPING_DELAY });

    await expectSubjectState({ canvas, expected: 'hello' });
    await expectEventLogged({
      canvas,
      matcher: { type: 'change', value: 'hello' },
    });
  },
});

export const FocusBlurEvents: Story = runProbeStory({
  probe: 'form-controls',
  scenarioId: 'form-controls:input.text:focus-blur',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectProbeReady(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await expectEventLogged({ canvas, matcher: { type: 'focus' } });

    const blurTarget = await canvas.findByTestId('blur-target');

    await userEvent.click(blurTarget);
    await expectEventLogged({ canvas, matcher: { type: 'blur' } });
  },
});
