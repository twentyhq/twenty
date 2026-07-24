import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import {
  errorHandler,
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { HOST_API_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HostApi/RouterLink',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

// KNOWN ISSUE (TDD) golden test: the fixture's react-router Link crashes at
// render (no router context in the sandbox), so the component errors and the
// host navigate API is never reached. When a router fix lands, flip this play
// to the acceptance assertions: find the link by role, click it, and expect
// hostApi.navigate to receive '/objects/companies' — a MemoryRouter cannot
// pass that (it renders the link but swallows the click into in-memory
// history), and clicking also requires the host to guard native anchor clicks,
// which otherwise navigate the host page away before the async worker
// round-trip can preventDefault.
export const RouterLink: Story = runFrontComponentStory({
  frontComponentBundleName: 'host-api-router-link',
  play: async ({ args }) => {
    const api = args.frontComponentHostCommunicationApi;

    if (!isDefined(api)) {
      throw new Error('frontComponentHostCommunicationApi is required');
    }

    await waitFor(
      () => {
        expect(errorHandler).toHaveBeenCalled();
      },
      { timeout: HOST_API_TIMEOUT },
    );

    expect(api.navigate).not.toHaveBeenCalled();
  },
});
