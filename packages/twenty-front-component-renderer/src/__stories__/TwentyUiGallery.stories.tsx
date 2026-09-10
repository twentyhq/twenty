import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  errorHandler,
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
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

// Every gallery fixture wraps each component in an error boundary and reports
// the aggregated result on the gallery-status element, so a single play
// function covers all submodules.
const galleryTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const status = await canvas.findByTestId(
    'gallery-status',
    {},
    { timeout: 30000 },
  );

  await waitFor(() => {
    expect(status).toHaveAttribute('data-failed-messages', '');
    expect(status).toHaveAttribute('data-failed-count', '0');
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
  play: galleryTest,
});

// Golden known-failure test (TDD): PASSES while the documented sandbox gap
// exists — the failing component set matches the expected set EXACTLY. It
// FAILS on regression (an unexpected component starts failing), on fix
// (nothing fails anymore) and on partial fix (only some expected components
// still fail): when your fix lands, flip the story back to the strict
// zero-failure `createGalleryStory` play.
const createKnownFailureGalleryTest =
  (expectedFailedComponents: string[]): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const status = await canvas.findByTestId(
      'gallery-status',
      {},
      { timeout: 30000 },
    );

    const expectedFailedComponentsSorted = [...expectedFailedComponents].sort();

    // Failure reports arrive asynchronously: retry until the failed set
    // matches the expected set exactly.
    await waitFor(() => {
      const failedComponents = (status.getAttribute('data-failed-names') ?? '')
        .split(', ')
        .filter((failedComponent) => failedComponent.length > 0)
        .sort();

      expect(failedComponents).toEqual(expectedFailedComponentsSorted);
    });

    expect(errorHandler).not.toHaveBeenCalled();
  };

const createKnownFailureGalleryStory = (
  name: string,
  expectedFailedComponents: string[],
  runtime?: 'preact',
): Story => ({
  ...createGalleryStory(name, runtime),
  play: createKnownFailureGalleryTest(expectedFailedComponents),
});

// KNOWN ISSUE (TDD): LinkChip crashes without a router context in the sandbox.
export const DataDisplayReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-data-display-gallery',
  ['LinkChip'],
);
export const DataDisplayPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-data-display-gallery',
  ['LinkChip'],
  'preact',
);

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

// KNOWN ISSUE (TDD): Base UI 1.8 radios require Element.matches(':disabled'),
// which the sandbox DOM does not implement.
export const InputReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-input-gallery',
  ['CardPicker', 'Radio', 'RadioGroup'],
);
export const InputPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-input-gallery',
  ['CardPicker'],
  'preact',
);

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

// KNOWN ISSUE (TDD): react-router Links crash without a router context.
const NAVIGATION_EXPECTED_FAILURES = ['RawLink', 'UndecoratedLink'];
export const NavigationReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-navigation-gallery',
  NAVIGATION_EXPECTED_FAILURES,
);
export const NavigationPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-navigation-gallery',
  NAVIGATION_EXPECTED_FAILURES,
  'preact',
);

export const SurfacesReact: Story = createGalleryStory(
  'twenty-ui-surfaces-gallery',
);
export const SurfacesPreact: Story = createGalleryStory(
  'twenty-ui-surfaces-gallery',
  'preact',
);

// KNOWN ISSUE (TDD) golden test: an open Modal (base-ui Dialog portal) hangs
// the React-runtime render — the gallery status must never mount. Works under
// Preact (see ModalOpenPreact). When fixed, flip this story to the strict
// zero-failure play used by ModalOpenPreact.
const modalOpenHangTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await expect(
    canvas.findByTestId('gallery-status', {}, { timeout: 10000 }),
  ).rejects.toThrow();
};

const modalOpenTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const status = await canvas.findByTestId(
    'gallery-status',
    {},
    { timeout: 15000 },
  );

  await waitFor(() => {
    expect(status).toHaveAttribute('data-failed-messages', '');
    expect(status).toHaveAttribute('data-failed-count', '0');
  });

  expect(errorHandler).not.toHaveBeenCalled();
};

export const ModalOpenReact: Story = {
  ...createGalleryStory('twenty-ui-modal-open-gallery'),
  play: modalOpenHangTest,
};
export const ModalOpenPreact: Story = {
  ...createGalleryStory('twenty-ui-modal-open-gallery', 'preact'),
  play: modalOpenTest,
};

// KNOWN ISSUE (TDD) golden test: monaco cannot load inside the sandbox worker
// (no script loading in the polyfilled DOM, opaque-origin CSP): the CodeEditor
// wrapper mounts but monaco's onMount never fires. If front components ever
// get a supported code editor path, flip the assertion to 'mounted'.
const codeEditorTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const codeEditor = await canvas.findByTestId(
    'code-editor-component',
    {},
    { timeout: 30000 },
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
    { timeout: 30000 },
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

const createComponentStory = (
  name: string,
  play: NonNullable<Story['play']>,
  runtime?: 'preact',
  expectedErrors: (string | RegExp)[] = [],
): Story => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
      runtime,
    ),
    executionContext: {
      frontComponentId: name,
      userId: null,
      recordId: null,
      selectedRecordIds: [],
      timelineActivityId: null,
      colorScheme: 'light',
    },
  },
  play: async (context) => {
    await expectFrontComponentMounted(within(context.canvasElement));
    await play(context);
    await expectSandboxErrors(expectedErrors);
  },
});

// Worker errors may be coalesced by the host's error state; require the
// triggering failure and reject errors outside the documented sandbox gaps.
const expectSandboxErrors = async (
  expectedErrors: (string | RegExp)[],
  optionalErrors: (string | RegExp)[] = [],
) => {
  await waitFor(
    () => {
      const messages = errorHandler.mock.calls.map(([error]) => error?.message);
      if (expectedErrors.length === 0) {
        expect(messages).toEqual([]);
        return;
      }
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
    { timeout: 30000 },
  );
};

const fieldControlsTest =
  (runtime: 'react' | 'preact'): NonNullable<Story['play']> =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
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
    await userEvent.type(email, 'alice', { delay: 30 });
    await userEvent.type(notes, 'Follow up', { delay: 30 });
    await userEvent.click(canvas.getByRole('button', { name: 'Read values' }));
    // Textarea's render element loses its change handler in the React runtime.
    await waitFor(() =>
      expect(canvas.getByTestId('reported-values')).toHaveTextContent(
        runtime === 'react'
          ? /^Email: alice; Notes:$/
          : 'Email: alice; Notes: Follow up',
      ),
    );
  };

const FIELD_EVENT_ERRORS = [
  "Uncaught TypeError: Cannot use 'in' operator to search for 'composedPath' in undefined",
];

export const FieldControlsReact = createComponentStory(
  'twenty-ui-field-controls',
  fieldControlsTest('react'),
  undefined,
  FIELD_EVENT_ERRORS,
);
export const FieldControlsPreact = createComponentStory(
  'twenty-ui-field-controls',
  fieldControlsTest('preact'),
  'preact',
  FIELD_EVENT_ERRORS,
);

const displayHelpersTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
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
};

export const DisplayHelpersReact = createComponentStory(
  'twenty-ui-display-helpers',
  displayHelpersTest,
);
export const DisplayHelpersPreact = createComponentStory(
  'twenty-ui-display-helpers',
  displayHelpersTest,
  'preact',
);

const listItemTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
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
};

export const ListItemReact = createComponentStory(
  'twenty-ui-list-item',
  listItemTest,
);
export const ListItemPreact = createComponentStory(
  'twenty-ui-list-item',
  listItemTest,
  'preact',
);

type SandboxFailureStoryOptions = {
  name: string;
  runtime?: 'preact';
  trigger?: { role: 'button' | 'combobox' | 'switch' | 'tab'; name: string };
  expectedErrors: (string | RegExp)[];
  optionalErrors?: (string | RegExp)[];
  description: string;
};

const createSandboxFailureStory = ({
  name,
  runtime,
  trigger,
  expectedErrors,
  optionalErrors,
  description,
}: SandboxFailureStoryOptions): Story => ({
  ...createComponentStory(name, async () => {}, runtime),
  parameters: {
    docs: {
      description: {
        story: `Known sandbox limitation: ${description} Replace the error assertions with successful interaction checks when fixed.`,
      },
    },
  },
  play: async ({ canvasElement }) => {
    if (trigger) {
      const canvas = within(canvasElement);
      await expectFrontComponentMounted(canvas);
      await userEvent.click(
        canvas.getByRole(trigger.role, { name: trigger.name }),
      );
    }
    await expectSandboxErrors(expectedErrors, optionalErrors);
  },
});

const TABS_ORDER_ERROR =
  /^(?:Uncaught TypeError: )?\w+\.compareDocumentPosition is not a function$/;
const COMPOSED_PATH_ERROR =
  "Uncaught TypeError: Cannot use 'in' operator to search for 'composedPath' in undefined";
const VIEWPORT_WIDTH_ERROR =
  "Uncaught TypeError: Cannot read properties of undefined (reading 'width')";
const POINTER_TYPE_ERROR =
  "Uncaught TypeError: Cannot read properties of undefined (reading 'pointerType')";

export const TabsReact = createSandboxFailureStory({
  name: 'twenty-ui-tabs',
  expectedErrors: [TABS_ORDER_ERROR],
  description:
    'Tabs cannot mount because the remote DOM lacks compareDocumentPosition.',
});
export const TabsPreact = createSandboxFailureStory({
  name: 'twenty-ui-tabs',
  runtime: 'preact',
  trigger: { role: 'tab', name: 'Activity' },
  expectedErrors: [COMPOSED_PATH_ERROR],
  optionalErrors: [TABS_ORDER_ERROR],
  description:
    'Tab activation expects nativeEvent.composedPath, which the forwarded event lacks.',
});

export const PopoverReact = createSandboxFailureStory({
  name: 'twenty-ui-popover',
  trigger: { role: 'button', name: 'Account details' },
  expectedErrors: [VIEWPORT_WIDTH_ERROR],
  description:
    'Opening the popover requires viewport data absent from the sandbox.',
});
export const PopoverPreact = createSandboxFailureStory({
  name: 'twenty-ui-popover',
  runtime: 'preact',
  trigger: { role: 'button', name: 'Account details' },
  expectedErrors: [VIEWPORT_WIDTH_ERROR],
  description:
    'Opening the popover requires viewport data absent from the sandbox.',
});

export const MenuReact = createSandboxFailureStory({
  name: 'twenty-ui-menu',
  trigger: { role: 'button', name: 'Account actions' },
  expectedErrors: [POINTER_TYPE_ERROR],
  optionalErrors: [VIEWPORT_WIDTH_ERROR],
  description: 'Menu opening lacks viewport data and nativeEvent.pointerType.',
});
export const MenuPreact = createSandboxFailureStory({
  name: 'twenty-ui-menu',
  runtime: 'preact',
  trigger: { role: 'button', name: 'Account actions' },
  expectedErrors: [POINTER_TYPE_ERROR],
  optionalErrors: [VIEWPORT_WIDTH_ERROR],
  description: 'Menu opening lacks viewport data and nativeEvent.pointerType.',
});

export const SelectReact = createSandboxFailureStory({
  name: 'twenty-ui-select',
  trigger: { role: 'combobox', name: 'Account stage' },
  expectedErrors: [POINTER_TYPE_ERROR],
  optionalErrors: [
    VIEWPORT_WIDTH_ERROR,
    COMPOSED_PATH_ERROR,
    TABS_ORDER_ERROR,
    /^(?:Uncaught TypeError: )?\w+\.matches is not a function$/,
  ],
  description:
    'Select opening lacks viewport data and nativeEvent.pointerType.',
});
export const SelectPreact = createSandboxFailureStory({
  name: 'twenty-ui-select',
  runtime: 'preact',
  trigger: { role: 'combobox', name: 'Account stage' },
  expectedErrors: [POINTER_TYPE_ERROR],
  optionalErrors: [
    VIEWPORT_WIDTH_ERROR,
    COMPOSED_PATH_ERROR,
    TABS_ORDER_ERROR,
    /^(?:Uncaught TypeError: )?\w+\.matches is not a function$/,
  ],
  description:
    'Select activation expects nativeEvent.pointerType, which the forwarded event lacks.',
});

const toastTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

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
};

export const ToastReact = createComponentStory('twenty-ui-toast', toastTest);
export const ToastPreact = createComponentStory(
  'twenty-ui-toast',
  toastTest,
  'preact',
);

export const AlertDialogReact = createSandboxFailureStory({
  name: 'twenty-ui-alert-dialog',
  trigger: { role: 'button', name: 'Delete account' },
  expectedErrors: [VIEWPORT_WIDTH_ERROR],
  description:
    'Opening the alert dialog requires viewport data absent from the sandbox.',
});
export const AlertDialogPreact = createSandboxFailureStory({
  name: 'twenty-ui-alert-dialog',
  runtime: 'preact',
  trigger: { role: 'button', name: 'Delete account' },
  expectedErrors: [VIEWPORT_WIDTH_ERROR],
  description:
    'Opening the alert dialog requires viewport data absent from the sandbox.',
});

const SWITCH_POINTER_ERROR =
  /^Uncaught TypeError: .+\.PointerEvent is not a constructor$/;

export const SwitchReact = createSandboxFailureStory({
  name: 'twenty-ui-switch',
  trigger: { role: 'switch', name: 'Email notifications' },
  expectedErrors: [SWITCH_POINTER_ERROR],
  description:
    'Switch activation constructs a PointerEvent, which the sandbox does not provide.',
});
export const SwitchPreact = createSandboxFailureStory({
  name: 'twenty-ui-switch',
  runtime: 'preact',
  trigger: { role: 'switch', name: 'Email notifications' },
  expectedErrors: [SWITCH_POINTER_ERROR],
  description:
    'Switch activation constructs a PointerEvent, which the sandbox does not provide.',
});
