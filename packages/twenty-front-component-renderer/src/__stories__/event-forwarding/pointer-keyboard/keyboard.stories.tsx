import { type Meta, type StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';
import { expectEventLogged } from '../../test-utils/matchers/expectEventLogged';
import { expectProbeReady } from '../../test-utils/matchers/expectProbeReady';
import { runProbeStory } from '../../test-utils/runProbeStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/PointerKeyboard/Keyboard',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const BasicKey: Story = runProbeStory({
  probe: 'pointer-keyboard',
  scenarioId: 'pointer-keyboard:input:keyboard',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectProbeReady(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await userEvent.keyboard('a');

    await expectEventLogged({
      canvas,
      matcher: { type: 'keydown', key: 'a', code: 'KeyA' },
    });
    await expectEventLogged({
      canvas,
      matcher: { type: 'keyup', key: 'a', code: 'KeyA' },
    });
  },
});

export const ShiftModifier: Story = runProbeStory({
  probe: 'pointer-keyboard',
  scenarioId: 'pointer-keyboard:input:keyboard',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectProbeReady(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await userEvent.keyboard('{Shift>}b{/Shift}');

    await expectEventLogged({
      canvas,
      matcher: { type: 'keydown', shiftKey: true },
    });
  },
});
