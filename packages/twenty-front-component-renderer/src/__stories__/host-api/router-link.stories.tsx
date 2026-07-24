import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
import { HOST_API_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
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

// KNOWN ISSUE (TDD): expected-failing until a router fix lands. This is the
// acceptance test for it: a MemoryRouter would render the link but swallow
// the click into in-memory history; only a host-navigator bridge makes the
// click reach the host navigate API. Today it fails earlier — the link never
// renders because the sandbox provides no router context.
export const RouterLink: Story = runFrontComponentStory({
  frontComponentBundleName: 'host-api-router-link',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const api = args.frontComponentHostCommunicationApi;

    if (!isDefined(api)) {
      throw new Error('frontComponentHostCommunicationApi is required');
    }

    await expectFrontComponentMounted(canvas);

    const link = await canvas.findByRole('link', { name: 'Go to companies' });
    expect(link).toHaveAttribute('href', '/objects/companies');

    await userEvent.click(link);

    await waitFor(
      () => {
        expect(api.navigate).toHaveBeenCalledWith(
          '/objects/companies',
          undefined,
          undefined,
          undefined,
        );
      },
      { timeout: HOST_API_TIMEOUT },
    );
  },
});
