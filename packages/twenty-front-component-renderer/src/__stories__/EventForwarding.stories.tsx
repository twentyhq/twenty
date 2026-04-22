import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '../host/components/FrontComponentRenderer';

import { getBuiltStoryComponentPathForRender } from './utils/getBuiltStoryComponentPathForRender';

const errorHandler = fn();

const createHostApiMocks = () => ({
  navigate: fn().mockResolvedValue(undefined),
  enqueueSnackbar: fn().mockResolvedValue(undefined),
  openSidePanelPage: fn().mockResolvedValue(undefined),
  closeSidePanel: fn().mockResolvedValue(undefined),
  unmountFrontComponent: fn().mockResolvedValue(undefined),
  updateProgress: fn().mockResolvedValue(undefined),
  requestAccessTokenRefresh: fn().mockResolvedValue('refreshed-token'),
  openCommandConfirmationModal: fn().mockResolvedValue(undefined),
});

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding',
  component: FrontComponentRenderer,
  parameters: {
    layout: 'centered',
  },
  args: {
    onError: errorHandler,
    applicationAccessToken: 'fake-token',
    executionContext: {
      frontComponentId: 'storybook-test',
      userId: null,
      recordId: null,
    },
    colorScheme: 'light',
    frontComponentHostCommunicationApi: createHostApiMocks(),
  },
  beforeEach: () => {
    errorHandler.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof FrontComponentRenderer>;

const MOUNT_TIMEOUT = 30000;
const INTERACTION_TIMEOUT = 5000;
const HOST_API_TIMEOUT = 10000;

const createComponentStory = (
  name: string,
  options?: { play?: Story['play'] },
): Story => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
    ),
  },
  ...(options?.play ? { play: options.play } : {}),
});

const createHostApiStory = (play: Story['play']): Story => ({
  ...createComponentStory('host-api-calls'),
  args: {
    ...createComponentStory('host-api-calls').args,
    frontComponentHostCommunicationApi: createHostApiMocks(),
  },
  play,
});

export const FormTextInput: Story = createComponentStory('form-events', {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId(
      'form-events-component',
      {},
      { timeout: MOUNT_TIMEOUT },
    );

    const textInput = await canvas.findByTestId('text-input');
    await userEvent.type(textInput, 'hello');

    expect(
      await canvas.findByText('hello', {}, { timeout: INTERACTION_TIMEOUT }),
    ).toBeVisible();
  },
});

export const FormCheckbox: Story = createComponentStory('form-events', {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId(
      'form-events-component',
      {},
      { timeout: MOUNT_TIMEOUT },
    );

    const checkbox = await canvas.findByTestId('checkbox-input');
    await userEvent.click(checkbox);

    expect(
      await canvas.findByText('true', {}, { timeout: INTERACTION_TIMEOUT }),
    ).toBeVisible();
  },
});

export const FormFocusAndBlur: Story = createComponentStory('form-events', {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId(
      'form-events-component',
      {},
      { timeout: MOUNT_TIMEOUT },
    );

    const textInput = await canvas.findByTestId('text-input');
    await userEvent.click(textInput);

    expect(
      await canvas.findByText('focused', {}, { timeout: INTERACTION_TIMEOUT }),
    ).toBeVisible();

    await userEvent.click(await canvas.findByTestId('form-events-component'));

    expect(
      await canvas.findByText('blurred', {}, { timeout: INTERACTION_TIMEOUT }),
    ).toBeVisible();
  },
});

export const FormSubmission: Story = createComponentStory('form-events', {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId(
      'form-events-component',
      {},
      { timeout: MOUNT_TIMEOUT },
    );

    const textInput = await canvas.findByTestId('text-input');
    await userEvent.type(textInput, 'hello');

    const checkbox = await canvas.findByTestId('checkbox-input');
    await userEvent.click(checkbox);

    const submitButton = await canvas.findByTestId('submit-button');
    await userEvent.click(submitButton);

    expect(
      await canvas.findByText(
        '{"text":"hello","checkbox":true}',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();
  },
});

export const KeyboardBasicInput: Story = createComponentStory(
  'keyboard-events',
  {
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      await canvas.findByTestId(
        'keyboard-events-component',
        {},
        { timeout: MOUNT_TIMEOUT },
      );

      const input = await canvas.findByTestId('keyboard-input');
      await userEvent.click(input);

      await userEvent.keyboard('a');

      expect(
        await canvas.findByText('a', {}, { timeout: INTERACTION_TIMEOUT }),
      ).toBeVisible();

      expect(
        await canvas.findByText('KeyA', {}, { timeout: INTERACTION_TIMEOUT }),
      ).toBeVisible();

      expect(
        await canvas.findByText(
          /^[1-9]\d*$/,
          {},
          { timeout: INTERACTION_TIMEOUT },
        ),
      ).toBeVisible();
    },
  },
);

export const KeyboardModifiers: Story = createComponentStory(
  'keyboard-events',
  {
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      await canvas.findByTestId(
        'keyboard-events-component',
        {},
        { timeout: MOUNT_TIMEOUT },
      );

      const input = await canvas.findByTestId('keyboard-input');
      await userEvent.click(input);

      await userEvent.keyboard('{Shift>}b{/Shift}');

      expect(
        await canvas.findByText('shift', {}, { timeout: INTERACTION_TIMEOUT }),
      ).toBeVisible();
    },
  },
);

export const HostApiNavigate: Story = createHostApiStory(
  async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const api = args.frontComponentHostCommunicationApi!;

    await canvas.findByTestId(
      'host-api-calls-component',
      {},
      { timeout: MOUNT_TIMEOUT },
    );

    const navigateBtn = await canvas.findByTestId('btn-navigate');
    await userEvent.click(navigateBtn);

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
);

export const HostApiSnackbar: Story = createHostApiStory(
  async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const api = args.frontComponentHostCommunicationApi!;

    await canvas.findByTestId(
      'host-api-calls-component',
      {},
      { timeout: MOUNT_TIMEOUT },
    );

    const snackbarBtn = await canvas.findByTestId('btn-snackbar');
    await userEvent.click(snackbarBtn);

    await waitFor(
      () => {
        expect(api.enqueueSnackbar).toHaveBeenCalledWith({
          message: 'Test notification',
          variant: 'success',
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
  },
);

export const HostApiProgress: Story = createHostApiStory(
  async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const api = args.frontComponentHostCommunicationApi!;

    await canvas.findByTestId(
      'host-api-calls-component',
      {},
      { timeout: MOUNT_TIMEOUT },
    );

    const progressBtn = await canvas.findByTestId('btn-progress');
    await userEvent.click(progressBtn);

    await waitFor(
      () => {
        expect(api.updateProgress).toHaveBeenCalledWith(50);
      },
      { timeout: HOST_API_TIMEOUT },
    );

    expect(
      await canvas.findByText(
        'progress:success',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();
  },
);

export const HostApiClosePanel: Story = createHostApiStory(
  async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const api = args.frontComponentHostCommunicationApi!;

    await canvas.findByTestId(
      'host-api-calls-component',
      {},
      { timeout: MOUNT_TIMEOUT },
    );

    const closePanelBtn = await canvas.findByTestId('btn-close-panel');
    await userEvent.click(closePanelBtn);

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
);
