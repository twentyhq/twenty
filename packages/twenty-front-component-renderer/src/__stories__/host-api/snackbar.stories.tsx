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
  title: 'FrontComponent/HostApi/Snackbar',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

const playSnackbar: NonNullable<Story['play']> = async ({
  canvasElement,
  args,
}) => {
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
      expect(api.enqueueSnackbar).toHaveBeenCalledWith({
        message: 'Test notification',
        variant: 'success',
        duration: 3000,
        detailedMessage: 'Changes are available to the team',
        dedupeKey: 'notification-example',
      });
    },
    { timeout: HOST_API_TIMEOUT },
  );

  expect(
    await canvas.findByText(
      'snackbar:success',
      {},
      { timeout: INTERACTION_TIMEOUT },
    ),
  ).toBeVisible();
};

export const Snackbar: Story = runFrontComponentStory({
  frontComponentBundleName: 'host-api-snackbar',
  play: playSnackbar,
});

export const SnackbarPreact: Story = runFrontComponentStory({
  frontComponentBundleName: 'host-api-snackbar',
  runtime: 'preact',
  play: playSnackbar,
});
