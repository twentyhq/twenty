import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';
import { expectProbeReady } from '../../test-utils/matchers/expectProbeReady';
import {
  INTERACTION_TIMEOUT,
  TYPING_TIMEOUT,
} from '../../test-utils/probe-timeouts';
import { runProbeStory } from '../../test-utils/runProbeStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/Caret/Input',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const InputCaretPreservedMidString: Story = runProbeStory({
  probe: 'caret',
  scenarioId: 'caret:input:mid-string',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectProbeReady(canvas);

    const subject = (await canvas.findByTestId('subject')) as HTMLInputElement;

    await waitFor(
      () => {
        expect(subject.value).toBe('Hello world');
      },
      { timeout: INTERACTION_TIMEOUT },
    );

    subject.focus();
    subject.setSelectionRange(4, 4);

    await userEvent.keyboard('X');

    await waitFor(
      () => {
        expect(subject.value).toBe('HellXo world');
        expect(canvas.getByTestId('subject-state').textContent).toBe(
          'HellXo world',
        );
        expect(subject.selectionStart).toBe(5);
        expect(subject.selectionEnd).toBe(5);
      },
      { timeout: TYPING_TIMEOUT },
    );
  },
});
