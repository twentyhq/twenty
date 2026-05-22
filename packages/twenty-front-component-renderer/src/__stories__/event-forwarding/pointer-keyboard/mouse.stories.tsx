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
  title: 'FrontComponent/EventForwarding/PointerKeyboard/Mouse',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const ClickEvent: Story = runProbeStory({
  probe: 'pointer-keyboard',
  scenarioId: 'pointer-keyboard:div:click',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectProbeReady(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await userEvent.click(subject);

    await expectSubjectState({ canvas, expected: '2' });
    await expectEventLogged({ canvas, matcher: { type: 'click' } });
  },
});

export const DoubleClickEvent: Story = runProbeStory({
  probe: 'pointer-keyboard',
  scenarioId: 'pointer-keyboard:div:dblclick',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectProbeReady(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.dblClick(subject);

    await expectSubjectState({ canvas, expected: '1' });
    await expectEventLogged({ canvas, matcher: { type: 'dblclick' } });
  },
});

export const MouseEnterLeave: Story = runProbeStory({
  probe: 'pointer-keyboard',
  scenarioId: 'pointer-keyboard:div:mouseenter-leave',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectProbeReady(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.hover(subject);
    await expectEventLogged({ canvas, matcher: { type: 'mouseenter' } });

    await userEvent.unhover(subject);
    await expectEventLogged({ canvas, matcher: { type: 'mouseleave' } });
  },
});
