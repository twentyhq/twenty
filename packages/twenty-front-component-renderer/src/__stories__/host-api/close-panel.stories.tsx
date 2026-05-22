import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { FrontComponentRenderer } from '../../host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '../shared/test-utils/matchers/expectFrontComponentMounted';
import {
  HOST_API_TIMEOUT,
  INTERACTION_TIMEOUT,
} from '../shared/test-utils/timeouts';
import { runFrontComponentStory } from '../shared/test-utils/runFrontComponentStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HostApi/ClosePanel',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const ClosePanel: Story = runFrontComponentStory({
  frontComponentBundleName: 'host-api',
  scenarioId: 'host-api:side-panel:close',
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
        expect(api.closeSidePanel).toHaveBeenCalled();
      },
      { timeout: HOST_API_TIMEOUT },
    );

    expect(
      await canvas.findByText(
        'closePanel:success',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();
  },
});
