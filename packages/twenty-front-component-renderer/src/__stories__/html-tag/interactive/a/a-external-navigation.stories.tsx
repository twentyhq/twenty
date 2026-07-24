import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

const requestExternalNavigation = fn();

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Interactive/A/ExternalNavigation',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: {
    ...FRONT_COMPONENT_STORY_DEFAULT_ARGS,
    onRequestExternalNavigation: requestExternalNavigation,
  },
  beforeEach: () => {
    resetFrontComponentStoryMocks();
    requestExternalNavigation.mockClear();
  },
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const ExternalAnchorClickIsHandedToTheHost: Story =
  runFrontComponentStory({
    frontComponentBundleName: 'a-properties',
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      await expectFrontComponentMounted(canvas);

      const link = await canvas.findByTestId('subject');

      await userEvent.click(link);

      await waitFor(
        () => {
          expect(requestExternalNavigation).toHaveBeenCalledWith(
            expect.objectContaining({ url: 'https://example.com/probe' }),
          );
        },
        { timeout: INTERACTION_TIMEOUT },
      );
    },
  });
