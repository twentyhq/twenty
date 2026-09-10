import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  errorHandler,
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import {
  MOUNT_TIMEOUT,
  TYPING_DELAY,
} from '@/__stories__/shared/test-utils/timeouts';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Twenty UI Gallery',
  component: FrontComponentRenderer,
  parameters: {
    layout: 'centered',
  },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;
type Story = StoryObj<typeof FrontComponentRenderer>;

// Exact failure sets catch regressions and make fixes require updated assertions.
const createGalleryTest =
  (expectedFailedComponents: string[] = []): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = await canvas.findByTestId(
      'gallery-status',
      {},
      { timeout: MOUNT_TIMEOUT },
    );

    await waitFor(() => {
      const failedComponents = (status.getAttribute('data-failed-names') ?? '')
        .split(', ')
        .filter((failedComponent) => failedComponent.length > 0)
        .sort();

      expect(failedComponents).toEqual([...expectedFailedComponents].sort());
      expect(status).toHaveAttribute(
        'data-failed-count',
        String(expectedFailedComponents.length),
      );
      if (expectedFailedComponents.length === 0) {
        expect(status).toHaveAttribute('data-failed-messages', '');
      }
    });

    expect(Number(status.getAttribute('data-total-count'))).toBeGreaterThan(0);
    expect(errorHandler).not.toHaveBeenCalled();
  };

const createGalleryStory = (name: string, runtime?: 'preact'): Story => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
      runtime,
    ),
  },
  play: createGalleryTest(),
});

const TABS_ORDER_ERROR =
  /^(?:Uncaught TypeError: )?\w+\.compareDocumentPosition is not a function$/;
const COMPOSED_PATH_ERROR =
  "Uncaught TypeError: Cannot use 'in' operator to search for 'composedPath' in undefined";
const VIEWPORT_WIDTH_ERROR =
  "Uncaught TypeError: Cannot read properties of undefined (reading 'width')";
const POINTER_TYPE_ERROR =
  "Uncaught TypeError: Cannot read properties of undefined (reading 'pointerType')";

// Worker errors may be coalesced by the host's error state; require the
// triggering failure and reject errors outside the documented sandbox gaps.
const expectSandboxErrors = async (
  expectedErrors: (string | RegExp)[],
  optionalErrors: (string | RegExp)[] = [],
) => {
  await waitFor(
    () => {
      const messages = errorHandler.mock.calls.map(([error]) => error?.message);
      expect(messages).toEqual(
        expect.arrayContaining(
          expectedErrors.map((message) =>
            message instanceof RegExp
              ? expect.stringMatching(message)
              : message,
          ),
        ),
      );
      expect(
        messages.filter(
          (message) =>
            ![...expectedErrors, ...optionalErrors].some((pattern) =>
              pattern instanceof RegExp
                ? typeof message === 'string' && pattern.test(message)
                : message === pattern,
            ),
        ),
      ).toEqual([]);
    },
    { timeout: MOUNT_TIMEOUT },
  );
};

type SandboxFailureTestOptions = {
  trigger?: { role: 'button' | 'combobox' | 'switch' | 'tab'; name: string };
  expectedErrors: (string | RegExp)[];
  optionalErrors?: (string | RegExp)[];
};

const createSandboxFailureTest =
  ({
    trigger,
    expectedErrors,
    optionalErrors,
  }: SandboxFailureTestOptions): Story['play'] =>
  async ({ canvasElement }) => {
    // Some failures prevent mounting; only interaction tests can await the card.
    if (trigger) {
      const canvas = within(canvasElement);
      await expectFrontComponentMounted(canvas);
      await userEvent.click(
        canvas.getByRole(trigger.role, { name: trigger.name }),
      );
    }
    await expectSandboxErrors(expectedErrors, optionalErrors);
  };

// LinkChip crashes without a router context in the sandbox.
const dataDisplayTest = createGalleryTest(['LinkChip']);

export const DataDisplayReact: Story = {
  ...createGalleryStory('twenty-ui-data-display-gallery'),
  play: dataDisplayTest,
};
export const DataDisplayPreact: Story = {
  ...createGalleryStory('twenty-ui-data-display-gallery', 'preact'),
  play: dataDisplayTest,
};

export const FeedbackReact: Story = createGalleryStory(
  'twenty-ui-feedback-gallery',
);
export const FeedbackPreact: Story = createGalleryStory(
  'twenty-ui-feedback-gallery',
  'preact',
);

export const IconReact: Story = createGalleryStory('twenty-ui-icon-gallery');
export const IconPreact: Story = createGalleryStory(
  'twenty-ui-icon-gallery',
  'preact',
);

// Base UI 1.8 radios require Element.matches(':disabled'),
// which the sandbox DOM does not implement.
export const InputReact: Story = {
  ...createGalleryStory('twenty-ui-input-gallery'),
  play: createGalleryTest(['CardPicker', 'Radio', 'RadioGroup']),
};
export const InputPreact: Story = {
  ...createGalleryStory('twenty-ui-input-gallery', 'preact'),
  play: createGalleryTest(['CardPicker']),
};

export const JsonVisualizerReact: Story = createGalleryStory(
  'twenty-ui-json-visualizer-gallery',
);
export const JsonVisualizerPreact: Story = createGalleryStory(
  'twenty-ui-json-visualizer-gallery',
  'preact',
);

export const LayoutReact: Story = createGalleryStory(
  'twenty-ui-layout-gallery',
);
export const LayoutPreact: Story = createGalleryStory(
  'twenty-ui-layout-gallery',
  'preact',
);

// react-router Links crash without a router context.
const navigationTest = createGalleryTest(['RawLink', 'UndecoratedLink']);

export const NavigationReact: Story = {
  ...createGalleryStory('twenty-ui-navigation-gallery'),
  play: navigationTest,
};
export const NavigationPreact: Story = {
  ...createGalleryStory('twenty-ui-navigation-gallery', 'preact'),
  play: navigationTest,
};

export const SurfacesReact: Story = createGalleryStory(
  'twenty-ui-surfaces-gallery',
);
export const SurfacesPreact: Story = createGalleryStory(
  'twenty-ui-surfaces-gallery',
  'preact',
);

// An open Modal portal hangs the React render without an error, so the
// missing gallery status is the only observable failure. Preact can mount it.
const modalOpenHangTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await expect(
    canvas.findByTestId('gallery-status', {}, { timeout: 10000 }),
  ).rejects.toThrow();
};

export const ModalOpenReact: Story = {
  ...createGalleryStory('twenty-ui-modal-open-gallery'),
  play: modalOpenHangTest,
};
export const ModalOpenPreact: Story = createGalleryStory(
  'twenty-ui-modal-open-gallery',
  'preact',
);

// Monaco cannot load scripts inside the sandbox worker, so the wrapper mounts
// but the editor's onMount never fires.
const codeEditorTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const codeEditor = await canvas.findByTestId(
    'code-editor-component',
    {},
    { timeout: MOUNT_TIMEOUT },
  );

  await new Promise((resolve) => setTimeout(resolve, 5000));

  expect(codeEditor).toHaveAttribute('data-monaco-mount-state', 'pending');
};

export const CodeEditorReact: Story = {
  ...createGalleryStory('twenty-ui-code-editor-gallery'),
  play: codeEditorTest,
};
export const CodeEditorPreact: Story = {
  ...createGalleryStory('twenty-ui-code-editor-gallery', 'preact'),
  play: codeEditorTest,
};

export const TypographyReact: Story = createGalleryStory(
  'twenty-ui-typography-gallery',
);
export const TypographyPreact: Story = createGalleryStory(
  'twenty-ui-typography-gallery',
  'preact',
);

const themeTokenTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const iconWrapper = await canvas.findByTestId(
    'theme-token-icon-wrapper',
    {},
    { timeout: MOUNT_TIMEOUT },
  );

  await waitFor(() => {
    const iconBox = iconWrapper.getBoundingClientRect();

    expect(Math.round(iconBox.width)).toBe(16);
    expect(Math.round(iconBox.height)).toBe(16);
  });

  expect(errorHandler).not.toHaveBeenCalled();
};

export const ThemeTokensReact: Story = {
  ...createGalleryStory('twenty-ui-theme-tokens'),
  play: themeTokenTest,
};
export const ThemeTokensPreact: Story = {
  ...createGalleryStory('twenty-ui-theme-tokens', 'preact'),
  play: themeTokenTest,
};

const fieldControlsTest =
  (runtime: 'react' | 'preact'): NonNullable<Story['play']> =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectFrontComponentMounted(canvas);

    const email = canvas.getByRole('textbox', { name: 'Email' });
    const notes = canvas.getByRole('textbox', { name: 'Notes' });

    expect(email).toHaveAccessibleDescription('Use your work email');
    // React writes boolean ARIA attributes as empty strings on remote elements.
    expect(
      canvas.getByRole('textbox', { name: 'Required name' }),
    ).toHaveAttribute('aria-invalid', runtime === 'react' ? '' : 'true');
    expect(canvas.getByText('Name is required')).toBeVisible();
    expect(canvas.getByRole('textbox', { name: 'Reference' })).toHaveValue(
      'REF-42',
    );
    expect(canvas.getByText('Keep this reference')).toBeVisible();
    expect(canvas.getByText('Reference cannot be changed')).toBeVisible();
    expect(
      canvas.getByRole('textbox', { name: 'Disabled input' }),
    ).toBeDisabled();

    await userEvent.click(canvas.getByText('Email', { exact: true }));
    await waitFor(() => expect(email).toHaveFocus());
    await userEvent.type(email, 'alice', { delay: TYPING_DELAY });
    await userEvent.type(notes, 'Follow up', { delay: TYPING_DELAY });
    await userEvent.click(canvas.getByRole('button', { name: 'Read values' }));
    // Textarea's render element loses its change handler in the React runtime.
    await waitFor(() =>
      expect(canvas.getByTestId('reported-values')).toHaveTextContent(
        runtime === 'react'
          ? /^Email: alice; Notes:$/
          : 'Email: alice; Notes: Follow up',
      ),
    );
    await expectSandboxErrors([COMPOSED_PATH_ERROR]);
  };

export const FieldControlsReact: Story = {
  ...createGalleryStory('twenty-ui-field-controls'),
  play: fieldControlsTest('react'),
};
export const FieldControlsPreact: Story = {
  ...createGalleryStory('twenty-ui-field-controls', 'preact'),
  play: fieldControlsTest('preact'),
};

const displayHelpersTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const truncatedText = canvas.getByText(
    'A long account name that should truncate',
  );
  const clampedText = canvas.getByText(/A longer account description/);

  expect(truncatedText.tagName).toBe('P');
  await waitFor(() => {
    expect(getComputedStyle(truncatedText).textOverflow).toBe('ellipsis');
    expect(truncatedText.scrollWidth).toBeGreaterThan(
      truncatedText.clientWidth,
    );
    expect(getComputedStyle(clampedText).webkitLineClamp).toBe('2');
  });
  expect(canvas.getByText('An overflowing reference number')).toBeVisible();
  expect(canvas.getByText('1234.5')).toBeVisible();
  expect(canvas.getByText('{"active":true}')).toBeVisible();
  expect(canvas.getByText('Account description')).toBeVisible();
  expect(canvas.getByText('Qualified')).toBeVisible();
  expect(errorHandler).not.toHaveBeenCalled();
};

export const DisplayHelpersReact: Story = {
  ...createGalleryStory('twenty-ui-display-helpers'),
  play: displayHelpersTest,
};
export const DisplayHelpersPreact: Story = {
  ...createGalleryStory('twenty-ui-display-helpers', 'preact'),
  play: displayHelpersTest,
};

const listItemTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const digest = canvas.getByText('Weekly digest');

  await userEvent.click(digest);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Digest: enabled'),
  );
  await userEvent.click(digest);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Digest: disabled'),
  );
  await userEvent.click(canvas.getByText('Disabled preference'));
  expect(canvas.getByRole('status')).toHaveTextContent('Digest: disabled');
  expect(errorHandler).not.toHaveBeenCalled();
};

export const ListItemReact: Story = {
  ...createGalleryStory('twenty-ui-list-item'),
  play: listItemTest,
};
export const ListItemPreact: Story = {
  ...createGalleryStory('twenty-ui-list-item', 'preact'),
  play: listItemTest,
};

// React cannot mount Tabs without compareDocumentPosition; Preact activation
// expects nativeEvent.composedPath, which the forwarded event lacks.
export const TabsReact: Story = {
  ...createGalleryStory('twenty-ui-tabs'),
  play: createSandboxFailureTest({ expectedErrors: [TABS_ORDER_ERROR] }),
};
export const TabsPreact: Story = {
  ...createGalleryStory('twenty-ui-tabs', 'preact'),
  play: createSandboxFailureTest({
    trigger: { role: 'tab', name: 'Activity' },
    expectedErrors: [COMPOSED_PATH_ERROR],
    optionalErrors: [TABS_ORDER_ERROR],
  }),
};

// Opening the popover requires viewport data absent from the sandbox.
const popoverTest = createSandboxFailureTest({
  trigger: { role: 'button', name: 'Account details' },
  expectedErrors: [VIEWPORT_WIDTH_ERROR],
});

export const PopoverReact: Story = {
  ...createGalleryStory('twenty-ui-popover'),
  play: popoverTest,
};
export const PopoverPreact: Story = {
  ...createGalleryStory('twenty-ui-popover', 'preact'),
  play: popoverTest,
};

// Menu opening lacks viewport data and nativeEvent.pointerType.
const menuTest = createSandboxFailureTest({
  trigger: { role: 'button', name: 'Account actions' },
  expectedErrors: [POINTER_TYPE_ERROR],
  optionalErrors: [VIEWPORT_WIDTH_ERROR],
});

export const MenuReact: Story = {
  ...createGalleryStory('twenty-ui-menu'),
  play: menuTest,
};
export const MenuPreact: Story = {
  ...createGalleryStory('twenty-ui-menu', 'preact'),
  play: menuTest,
};

// Select opening lacks viewport data and nativeEvent.pointerType.
const selectTest = createSandboxFailureTest({
  trigger: { role: 'combobox', name: 'Account stage' },
  expectedErrors: [POINTER_TYPE_ERROR],
  optionalErrors: [
    VIEWPORT_WIDTH_ERROR,
    COMPOSED_PATH_ERROR,
    TABS_ORDER_ERROR,
    /^(?:Uncaught TypeError: )?\w+\.matches is not a function$/,
  ],
});

export const SelectReact: Story = {
  ...createGalleryStory('twenty-ui-select'),
  play: selectTest,
};
export const SelectPreact: Story = {
  ...createGalleryStory('twenty-ui-select', 'preact'),
  play: selectTest,
};

const toastTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  expect(canvas.getByRole('status')).toHaveTextContent('Account saved');
  expect(
    canvas.getByText('Your changes are available to the team'),
  ).toBeVisible();
  await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
  await waitFor(() =>
    expect(
      canvas.getByText('Notification: visible; Action: undone'),
    ).toBeVisible(),
  );
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
  await waitFor(() =>
    expect(
      canvas.getByText('Notification: visible; Action: cancelled'),
    ).toBeVisible(),
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Dismiss notification' }),
  );
  await waitFor(() =>
    expect(canvas.queryByRole('status')).not.toBeInTheDocument(),
  );
  expect(
    canvas.getByText('Notification: closed; Action: cancelled'),
  ).toBeVisible();
  expect(errorHandler).not.toHaveBeenCalled();
};

export const ToastReact: Story = {
  ...createGalleryStory('twenty-ui-toast'),
  play: toastTest,
};
export const ToastPreact: Story = {
  ...createGalleryStory('twenty-ui-toast', 'preact'),
  play: toastTest,
};

// Opening the alert dialog requires viewport data absent from the sandbox.
const alertDialogTest = createSandboxFailureTest({
  trigger: { role: 'button', name: 'Delete account' },
  expectedErrors: [VIEWPORT_WIDTH_ERROR],
});

export const AlertDialogReact: Story = {
  ...createGalleryStory('twenty-ui-alert-dialog'),
  play: alertDialogTest,
};
export const AlertDialogPreact: Story = {
  ...createGalleryStory('twenty-ui-alert-dialog', 'preact'),
  play: alertDialogTest,
};

// Switch activation constructs a PointerEvent, which the sandbox lacks.
const switchTest = createSandboxFailureTest({
  trigger: { role: 'switch', name: 'Email notifications' },
  expectedErrors: [
    /^Uncaught TypeError: .+\.PointerEvent is not a constructor$/,
  ],
});

export const SwitchReact: Story = {
  ...createGalleryStory('twenty-ui-switch'),
  play: switchTest,
};
export const SwitchPreact: Story = {
  ...createGalleryStory('twenty-ui-switch', 'preact'),
  play: switchTest,
};
