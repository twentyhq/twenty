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
  title: 'FrontComponent/EventForwarding/Form/InputFile',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const SingleFile: Story = runProbeStory({
  probe: 'form-controls',
  scenarioId: 'form-controls:input.file:single',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectProbeReady(canvas);

    const subject = (await canvas.findByTestId('subject')) as HTMLInputElement;

    const file = new File(['hello world'], 'hello.txt', {
      type: 'text/plain',
      lastModified: 1700000000000,
    });

    await userEvent.upload(subject, file);

    await expectEventLogged({
      canvas,
      matcher: {
        type: 'change',
        files: [{ name: 'hello.txt', type: 'text/plain' }],
      },
    });
  },
});

export const MultipleFiles: Story = runProbeStory({
  probe: 'form-controls',
  scenarioId: 'form-controls:input.file:multiple',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectProbeReady(canvas);

    const subject = (await canvas.findByTestId('subject')) as HTMLInputElement;

    const first = new File(['a'], 'one.png', { type: 'image/png' });
    const second = new File(['bb'], 'two.png', { type: 'image/png' });

    await userEvent.upload(subject, [first, second]);

    await expectEventLogged({
      canvas,
      matcher: {
        type: 'change',
        files: [
          { name: 'one.png', type: 'image/png' },
          { name: 'two.png', type: 'image/png' },
        ],
      },
    });
  },
});
