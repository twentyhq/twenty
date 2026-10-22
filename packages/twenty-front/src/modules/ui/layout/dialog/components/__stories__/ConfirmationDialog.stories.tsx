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
import { Button } from 'twenty-ui/primitives/input';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

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
    const header = title.parentElement;
    const description = canvasElement.ownerDocument.getElementById(
      dialog.getAttribute('aria-describedby') ?? '',
    );
    const confirmButton = within(dialog).getByRole('button', {
      name: 'Delete',
    });
    const footer = confirmButton.parentElement;

    if (!isDefined(header) || !isDefined(description) || !isDefined(footer)) {
      throw new Error('Confirmation dialog parts are missing');
    }

    await waitFor(() => expect(dialog).toBeVisible());
    expect(dialog).toHaveAccessibleDescription(
      'Velit dolore aliquip laborum occaecat fugiat.',
    );
    expect(dialog).toHaveAttribute('data-size', 'sm');
    const dialogStyle = getComputedStyle(dialog);
    expect(dialogStyle.width).toBe('300px');
    expect(dialogStyle.padding).toBe('0px');
    expect(dialogStyle.borderRadius).toBe(
      dialogStyle.getPropertyValue('--t-border-radius-md').trim(),
    );
    expect(header).toHaveStyle({ padding: '24px', gap: '8px' });
    expect(title).toHaveStyle({
      'margin-block-end': '0px',
      textAlign: 'center',
    });
    expect(title).toHaveAttribute('data-size', 'lg');
    expect(description).toHaveStyle({
      color: getComputedStyle(dialog).getPropertyValue(
        '--t-font-color-secondary',
      ),
      margin: '0px',
      textAlign: 'center',
    });
    const descriptionStyle = getComputedStyle(description);
    expect(Number.parseFloat(descriptionStyle.lineHeight)).toBe(
      Number.parseFloat(descriptionStyle.fontSize) * 1.5,
    );
    expect(footer).toHaveStyle({
      gap: '8px',
      padding: '0px 24px 24px',
    });
    for (const button of within(footer).getAllByRole('button')) {
      expect(button).toHaveStyle({ width: '252px', 'margin-top': '0px' });
    }
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
    onConfirmClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', {
      name: 'Pariatur labore.',
    });
    const input = within(dialog).getByTestId('confirmation-modal-input');
    const confirmButton = within(dialog).getByRole('button', {
      name: 'Delete',
    });

    await waitFor(() => expect(input).toHaveFocus());
    expect(confirmButton).toBeDisabled();
    await userEvent.type(input, 'incorrect');
    await userEvent.keyboard('{Enter}');
    expect(args.onConfirmClick).not.toHaveBeenCalled();
    expect(dialog).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, 'email@test.dev');
    await waitFor(() => expect(confirmButton).toBeEnabled());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(args.onConfirmClick).toHaveBeenCalledOnce());
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const CloseOnEscape: Story = {
  args: {
    dialogId: 'confirmation-modal',
    title: 'Escape Key Test',
    subtitle: 'This modal should close when pressing the Escape key.',
    confirmButtonText: 'Confirm',
    onClose: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);

    await body.findByText('Escape Key Test');

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(args.onClose).toHaveBeenCalledTimes(1);
    });
  },
};

export const CloseOnClickOutside: Story = {
  args: {
    dialogId: 'confirmation-modal',
    title: 'Click Outside Test',
    subtitle: 'This modal should close when clicking outside of it.',
    confirmButtonText: 'Confirm',
    onClose: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);

    await body.findByText('Click Outside Test');

    const backdrop = await body.findByTestId('dialog-viewport');

    await waitFor(() =>
      expect(body.getByRole('button', { name: 'Cancel' })).toHaveFocus(),
    );

    await userEvent.click(backdrop);

    await waitFor(() => {
      expect(args.onClose).toHaveBeenCalledTimes(1);
    });
  },
};

export const ConfirmWithEnterKey: Story = {
  args: {
    dialogId: 'confirmation-modal',
    title: 'Enter Key Test',
    subtitle: 'This modal should confirm when pressing the Enter key.',
    confirmButtonText: 'Confirm',
    onConfirmClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);

    await body.findByText('Enter Key Test');

    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(args.onConfirmClick).toHaveBeenCalledTimes(1);
    });
  },
};

export const CancelButtonClick: Story = {
  args: {
    dialogId: 'confirmation-modal',
    title: 'Cancel Button Test',
    subtitle: 'Clicking the cancel button should close the modal',
    confirmButtonText: 'Confirm',
    onClose: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);

    await body.findByText('Cancel Button Test');

    const cancelButton = await body.findByRole('button', {
      name: /Cancel/,
    });
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(args.onClose).toHaveBeenCalledTimes(1);
    });
  },
};

export const ConfirmButtonClick: Story = {
  args: {
    dialogId: 'confirmation-modal',
    title: 'Confirm Button Test',
    subtitle: 'Clicking the confirm button should trigger the confirm action',
    confirmButtonText: 'Confirm',
    onConfirmClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);

    await body.findByText('Confirm Button Test');

    const confirmButton = await body.findByRole('button', {
      name: /Confirm/,
    });

    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(args.onConfirmClick).toHaveBeenCalledTimes(1);
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

export const AdditionalActions: Story = {
  args: {
    ...Default.args,
    AdditionalButtons: (
      <Button fullWidth variant="outline">
        Alternative action
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Pariatur labore.' },
    );
    const buttons = within(dialog).getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual([
      'Cancel',
      'Alternative action',
      'Delete',
    ]);
    await waitFor(() => expect(buttons[0]).toHaveFocus());
    await userEvent.tab();
    expect(buttons[1]).toHaveFocus();
    await userEvent.tab();
    expect(buttons[2]).toHaveFocus();
    for (const button of buttons) {
      expect(button).toHaveStyle({ width: '252px', 'margin-top': '0px' });
    }
  },
};

export const HiddenCancelWithAdditionalAction: Story = {
  args: {
    ...AdditionalActions.args,
    hideCancelButton: true,
    onConfirmClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Pariatur labore.' },
    );
    expect(within(dialog).queryByRole('button', { name: 'Cancel' })).toBeNull();
    const additionalButton = within(dialog).getByRole('button', {
      name: 'Alternative action',
    });
    const confirmButton = within(dialog).getByRole('button', {
      name: 'Delete',
    });
    await waitFor(() => expect(additionalButton).toHaveFocus());
    await userEvent.tab();
    expect(confirmButton).toHaveFocus();
    await userEvent.click(confirmButton);
    await waitFor(() => expect(args.onConfirmClick).toHaveBeenCalledOnce());
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
