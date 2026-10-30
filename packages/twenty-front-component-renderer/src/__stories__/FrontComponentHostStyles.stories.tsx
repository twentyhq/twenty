import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import 'twenty-ui/style.css';

import {
  errorHandler,
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  FRONT_COMPONENT_STORY_DEFAULT_EXECUTION_CONTEXT,
  hostApiMocks,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Host Styles',
  component: FrontComponentRenderer,
  parameters: {
    layout: 'centered',
  },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;
type Story = StoryObj<typeof FrontComponentRenderer>;

export const GlobalResetKeepsHostTwentyUiStyles: Story = {
  render: () => (
    <>
      <Button>Host button</Button>
      <FrontComponentRenderer
        componentUrl={getBuiltStoryComponentPathForRender(
          'tailwind-example.front-component',
        )}
        applicationAccessToken={
          FRONT_COMPONENT_STORY_DEFAULT_ARGS.applicationAccessToken
        }
        executionContext={FRONT_COMPONENT_STORY_DEFAULT_EXECUTION_CONTEXT}
        frontComponentHostCommunicationApi={hostApiMocks}
        onError={errorHandler}
        colorScheme="light"
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hostButton = canvas.getByRole('button', { name: 'Host button' });
    const hostButtonPaddingBeforeMount =
      getComputedStyle(hostButton).paddingLeft;

    const tailwindComponent = await canvas.findByTestId(
      'tailwind-component',
      {},
      { timeout: MOUNT_TIMEOUT },
    );

    await waitFor(
      () => {
        expect(getComputedStyle(tailwindComponent).paddingLeft).not.toBe('0px');
      },
      { timeout: MOUNT_TIMEOUT },
    );

    expect(hostButtonPaddingBeforeMount).not.toBe('0px');
    expect(getComputedStyle(hostButton).paddingLeft).toBe(
      hostButtonPaddingBeforeMount,
    );
  },
};

export const LayeredUtilitiesOverrideHostReset: Story = {
  render: () => (
    <FrontComponentRenderer
      componentUrl={getBuiltStoryComponentPathForRender(
        'layered-utilities-example.front-component',
      )}
      applicationAccessToken={
        FRONT_COMPONENT_STORY_DEFAULT_ARGS.applicationAccessToken
      }
      executionContext={FRONT_COMPONENT_STORY_DEFAULT_EXECUTION_CONTEXT}
      frontComponentHostCommunicationApi={hostApiMocks}
      onError={errorHandler}
      colorScheme="light"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const utilityButton = await canvas.findByTestId(
      'layered-utilities-button',
      {},
      { timeout: MOUNT_TIMEOUT },
    );

    await waitFor(
      () => {
        expect(getComputedStyle(utilityButton).backgroundColor).toBe(
          'rgb(37, 99, 235)',
        );
      },
      { timeout: MOUNT_TIMEOUT },
    );

    expect(getComputedStyle(utilityButton).paddingLeft).not.toBe('0px');
  },
};
