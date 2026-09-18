import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { isDialogOpenedComponentState } from '@/ui/layout/dialog/states/isDialogOpenedComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ComponentDecorator } from 'twenty-ui/testing';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { sleep } from '~/utils/sleep';

const JotaiInitDecorator: Decorator = (Story) => {
  jotaiStore.set(
    isDialogOpenedComponentState.atomFamily({
      instanceId: 'confirmation-modal',
    }),
    true,
  );
  jotaiStore.set(focusStackState.atom, [
    {
      focusId: 'confirmation-modal',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'confirmation-modal',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    },
  ]);
  return <Story />;
};

const meta: Meta<typeof ConfirmationDialog> = {
  title: 'UI/Layout/Dialog/ConfirmationDialog',
  component: ConfirmationDialog,
  decorators: [JotaiInitDecorator, RootDecorator, ComponentDecorator],
  parameters: {
    disableHotkeyInitialization: true,
  },
};
export default meta;

type Story = StoryObj<typeof ConfirmationDialog>;

const closeMock = fn();
const confirmMock = fn();

export const Default: Story = {
  args: {
    dialogId: 'confirmation-modal',
    title: 'Pariatur labore.',
    subtitle: 'Velit dolore aliquip laborum occaecat fugiat.',
    confirmButtonText: 'Delete',
    onConfirmClick: fn(),
  },
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Pariatur labore.' },
    );
    const title = within(dialog).getByRole('heading', { level: 2 });
    const subtitle = within(dialog).getByText(
      'Velit dolore aliquip laborum occaecat fugiat.',
    );
    const description = canvasElement.ownerDocument.getElementById(
      dialog.getAttribute('aria-describedby') ?? '',
    );

    expect(dialog).toHaveAccessibleDescription(
      'Velit dolore aliquip laborum occaecat fugiat.',
    );
    expect(getComputedStyle(dialog).width).toBe('272px');
    expect(getComputedStyle(dialog).padding).toBe('24px');
    expect(getComputedStyle(title).marginBlockEnd).toBe('16px');
    expect(getComputedStyle(title).textAlign).toBe('center');
    expect(title).toHaveAttribute('data-size', 'lg');
    expect(getComputedStyle(subtitle).textAlign).toBe('center');
    expect(getComputedStyle(subtitle).color).toBe(
      getComputedStyle(dialog).color,
    );
    expect(getComputedStyle(subtitle).lineHeight).toBe(
      getComputedStyle(dialog).lineHeight,
    );
    expect(description).not.toBeNull();
    expect(getComputedStyle(description!).marginBottom).toBe('24px');
  },
};

export const RichSubtitle: Story = {
  args: {
    ...Default.args,
    subtitle: (
      <div>
        <p>Remove this record.</p>
        <ul>
          <li>Files will be removed.</li>
        </ul>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Pariatur labore.' },
    );
    const description = canvasElement.ownerDocument.getElementById(
      dialog.getAttribute('aria-describedby') ?? '',
    );

    expect(dialog).toHaveAccessibleDescription(
      'Remove this record. Files will be removed.',
    );
    expect(description?.tagName).toBe('DIV');
    expect(within(dialog).getByRole('list')).toBeVisible();
    expect(dialog.querySelector('p p, p div, p ul')).toBeNull();
  },
};

export const InputConfirmation: Story = {
  args: {
    confirmationValue: 'email@test.dev',
    confirmationPlaceholder: 'email@test.dev',
    ...Default.args,
  },
};

export const CloseOnEscape: Story = {
  args: {
    dialogId: 'confirmation-modal',
    title: 'Escape Key Test',
    subtitle: 'This modal should close when pressing the Escape key.',
    confirmButtonText: 'Confirm',
    onClose: closeMock,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await body.findByText('Escape Key Test');

    closeMock.mockClear();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(closeMock).toHaveBeenCalledTimes(1);
    });
  },
};

export const CloseOnClickOutside: Story = {
  args: {
    dialogId: 'confirmation-modal',
    title: 'Click Outside Test',
    subtitle: 'This modal should close when clicking outside of it.',
    confirmButtonText: 'Confirm',
    onClose: closeMock,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await body.findByText('Click Outside Test');

    const backdrop = await body.findByTestId('dialog-viewport');

    // We need to wait for the outside click listener to be registered
    await sleep(100);

    await userEvent.click(backdrop);

    await waitFor(() => {
      expect(closeMock).toHaveBeenCalledTimes(1);
    });
  },
};

export const ConfirmWithEnterKey: Story = {
  args: {
    dialogId: 'confirmation-modal',
    title: 'Enter Key Test',
    subtitle: 'This modal should confirm when pressing the Enter key.',
    confirmButtonText: 'Confirm',
    onConfirmClick: confirmMock,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await body.findByText('Enter Key Test');

    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalledTimes(1);
    });
  },
};

export const CancelButtonClick: Story = {
  args: {
    dialogId: 'confirmation-modal',
    title: 'Cancel Button Test',
    subtitle: 'Clicking the cancel button should close the modal',
    confirmButtonText: 'Confirm',
    onClose: closeMock,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await body.findByText('Cancel Button Test');

    const cancelButton = await body.findByRole('button', {
      name: /Cancel/,
    });
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(closeMock).toHaveBeenCalledTimes(1);
    });
  },
};

export const ConfirmButtonClick: Story = {
  args: {
    dialogId: 'confirmation-modal',
    title: 'Confirm Button Test',
    subtitle: 'Clicking the confirm button should trigger the confirm action',
    confirmButtonText: 'Confirm',
    onConfirmClick: confirmMock,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await body.findByText('Confirm Button Test');

    const confirmButton = await body.findByRole('button', {
      name: /Confirm/,
    });

    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalledTimes(1);
    });
  },
};

export const ResetsInputWhenReopened: Story = {
  args: {
    dialogId: 'confirmation-modal',
    title: 'Reopen Reset Test',
    subtitle: 'Reopening the modal should clear the confirmation input.',
    confirmButtonText: 'Confirm',
    confirmationValue: 'email@test.dev',
    confirmationPlaceholder: 'email@test.dev',
    onConfirmClick: fn(),
    onClose: fn(),
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await body.findByText('Reopen Reset Test');

    await userEvent.type(
      await body.findByTestId('confirmation-modal-input'),
      'email@test.dev',
    );

    await waitFor(() => {
      expect(
        body.getByTestId('confirmation-modal-confirm-button'),
      ).toBeEnabled();
    });

    await userEvent.click(body.getByTestId('confirmation-modal-cancel-button'));

    await waitFor(() => {
      expect(
        body.queryByTestId('confirmation-modal-input'),
      ).not.toBeInTheDocument();
    });

    jotaiStore.set(
      isDialogOpenedComponentState.atomFamily({
        instanceId: 'confirmation-modal',
      }),
      true,
    );

    await body.findByTestId('confirmation-modal-input');

    await waitFor(() => {
      expect(body.getByTestId('confirmation-modal-input')).toHaveValue('');
      expect(
        body.getByTestId('confirmation-modal-confirm-button'),
      ).toBeDisabled();
    });
  },
};

export const PreventConfirmationWhileLoading: Story = {
  args: {
    ...Default.args,
    loading: true,
    onConfirmClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
    );
    expect(
      within(dialog).getByRole('button', { name: 'Delete' }),
    ).toBeDisabled();
    await userEvent.keyboard('{Enter}');
    expect(args.onConfirmClick).not.toHaveBeenCalled();
    expect(dialog).toBeInTheDocument();
  },
};
