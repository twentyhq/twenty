import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';
import { expectProbeReady } from '../../test-utils/matchers/expectProbeReady';
import {
  HOST_API_TIMEOUT,
  INTERACTION_TIMEOUT,
} from '../../test-utils/probe-timeouts';
import { runProbeStory } from '../../test-utils/runProbeStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/HostApi/Navigate',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const Navigate: Story = runProbeStory({
  probe: 'host-api',
  scenarioId: 'host-api:navigate',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const api = args.frontComponentHostCommunicationApi;

    if (api === undefined) {
      throw new Error('frontComponentHostCommunicationApi is required');
    }

    await expectProbeReady(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);

    await waitFor(
      () => {
        expect(api.navigate).toHaveBeenCalled();
      },
      { timeout: HOST_API_TIMEOUT },
    );

    expect(
      await canvas.findByText(
        'navigate:success',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();
  },
});
