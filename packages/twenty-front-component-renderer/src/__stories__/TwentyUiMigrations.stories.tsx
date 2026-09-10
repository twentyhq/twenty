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
  title: 'FrontComponent/Twenty UI Migrations',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;
type Story = StoryObj<typeof FrontComponentRenderer>;

const createMigrationStory = (
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

export const FieldControlsReact = createMigrationStory(
  'twenty-ui-field-controls',
  fieldControlsTest('react'),
  undefined,
  FIELD_EVENT_ERRORS,
);
export const FieldControlsPreact = createMigrationStory(
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

export const DisplayHelpersReact = createMigrationStory(
  'twenty-ui-display-helpers',
  displayHelpersTest,
);
export const DisplayHelpersPreact = createMigrationStory(
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

export const ListItemReact = createMigrationStory(
  'twenty-ui-list-item',
  listItemTest,
);
export const ListItemPreact = createMigrationStory(
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
  ...createMigrationStory(name, async () => {}, runtime),
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

export const ToastReact = createMigrationStory('twenty-ui-toast', toastTest);
export const ToastPreact = createMigrationStory(
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
