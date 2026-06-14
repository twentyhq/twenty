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
  title: 'FrontComponent/HostApi/CopyToClipboard',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const CopyToClipboard: Story = runFrontComponentStory({
  frontComponentBundleName: 'host-api-copy-to-clipboard',
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
        expect(api.copyToClipboard).toHaveBeenCalledWith('Hello clipboard');
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
