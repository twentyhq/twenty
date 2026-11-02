import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
import { HOST_API_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

const STORY_API_URL = 'https://api.twenty.test';
const STORY_METADATA_URL = `${STORY_API_URL}/metadata`;
const STORY_THREAD_ID = '6f1d7c2a-3b4e-4f5a-8b9c-0d1e2f3a4b5c';

const receiveMetadataRequestAuthorization = fn();

const installMetadataFetchStub = () => {
  const delegateFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const isMetadataRequest =
      request.method === 'POST' && request.url === STORY_METADATA_URL;

    if (!isMetadataRequest) {
      return delegateFetch(input, init);
    }

    receiveMetadataRequestAuthorization(request.headers.get('Authorization'));

    return new Response(
      JSON.stringify({
        data: { sendInboxMessage: { threadId: STORY_THREAD_ID } },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  return () => {
    window.fetch = delegateFetch;
  };
};

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HostApi/SendInboxMessage',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: { ...FRONT_COMPONENT_STORY_DEFAULT_ARGS, apiUrl: STORY_API_URL },
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

const sendInboxMessageStory = runFrontComponentStory({
  frontComponentBundleName: 'host-api-send-inbox-message',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    await userEvent.click(await canvas.findByTestId('subject'));

    expect(
      await canvas.findByText(
        `sendInboxMessage:success:${STORY_THREAD_ID}`,
        {},
        { timeout: HOST_API_TIMEOUT },
      ),
    ).toBeVisible();
    expect(receiveMetadataRequestAuthorization).toHaveBeenCalledWith(
      `Bearer ${FRONT_COMPONENT_STORY_DEFAULT_ARGS.applicationAccessToken}`,
    );
  },
});

export const SendInboxMessage: Story = {
  ...sendInboxMessageStory,
  beforeEach: () => {
    receiveMetadataRequestAuthorization.mockClear();

    return installMetadataFetchStub();
  },
};
