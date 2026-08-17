import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
import {
  HOST_API_TIMEOUT,
  INTERACTION_TIMEOUT,
} from '@/__stories__/shared/test-utils/timeouts';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HostApi/NavigatorClipboard',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

// Runs the real sandbox: iframe, worker, and bridge in an actual browser, so
// it fails if the polyfill never reaches the worker realm — which the unit
// tests of the install function cannot detect.
export const NavigatorClipboard: Story = runFrontComponentStory({
  frontComponentBundleName: 'host-api-navigator-clipboard',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const api = args.frontComponentHostCommunicationApi;

    if (!isDefined(api)) {
      throw new Error('frontComponentHostCommunicationApi is required');
    }

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);

    await waitFor(
      () => {
        expect(api.copyToClipboard).toHaveBeenCalledWith(
          'Hello standard clipboard',
        );
      },
      { timeout: HOST_API_TIMEOUT },
    );

    expect(
      await canvas.findByText(
        'clipboard:success',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();
  },
});
