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
  title: 'FrontComponent/EventForwarding/Form/InputCheckbox',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const CheckedRoundTrip: Story = runProbeStory({
  probe: 'form-controls',
  scenarioId: 'form-controls:input.checkbox:checked',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectProbeReady(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);

    await expectSubjectState({ canvas, expected: 'true' });
    await expectEventLogged({
      canvas,
      matcher: { type: 'change', checked: true },
    });

    await userEvent.click(subject);

    await expectSubjectState({ canvas, expected: 'false' });
    await expectEventLogged({
      canvas,
      matcher: { type: 'change', checked: false },
    });
  },
});
