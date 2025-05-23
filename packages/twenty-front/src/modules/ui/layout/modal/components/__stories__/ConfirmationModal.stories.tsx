import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';

import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { internalHotkeysEnabledScopesState } from '@/ui/utilities/hotkey/states/internal/internalHotkeysEnabledScopesState';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { sleep } from '~/utils/sleep';
import { isModalOpenedComponentState } from '../../states/isModalOpenedComponentState';
import { ConfirmationModal } from '../ConfirmationModal';

const initializeState = ({ set }: { set: (atom: any, value: any) => void }) => {
  set(
    isModalOpenedComponentState.atomFamily({
      instanceId: 'confirmation-modal',
    }),
    true,
  );

  set(currentHotkeyScopeState, {
    scope: ModalHotkeyScope.ModalFocus,
    customScopes: {
      commandMenu: true,
      goto: false,
      keyboardShortcutMenu: false,
    },
  });

  set(internalHotkeysEnabledScopesState, [ModalHotkeyScope.ModalFocus]);

  set(focusStackState, [
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
};

const meta: Meta<typeof ConfirmationModal> = {
  title: 'UI/Layout/Modal/ConfirmationModal',
  component: ConfirmationModal,
  decorators: [RootDecorator, ComponentDecorator, I18nFrontDecorator],
  parameters: {
    initializeState,
    disableHotkeyInitialization: true,
  },
};
export default meta;

type Story = StoryObj<typeof ConfirmationModal>;

const closeMock = fn();
const confirmMock = fn();

export const Default: Story = {
  args: {
    modalId: 'confirmation-modal',
    title: 'Pariatur labore.',
    subtitle: 'Velit dolore aliquip laborum occaecat fugiat.',
    confirmButtonText: 'Delete',
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
    modalId: 'confirmation-modal',
    title: 'Escape Key Test',
    subtitle: 'This modal should close when pressing the Escape key.',
    confirmButtonText: 'Confirm',
    onClose: closeMock,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Escape Key Test');

    closeMock.mockClear();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(closeMock).toHaveBeenCalledTimes(1);
    });
  },
};

export const CloseOnClickOutside: Story = {
  args: {
    modalId: 'confirmation-modal',
    title: 'Click Outside Test',
    subtitle: 'This modal should close when clicking outside of it.',
    confirmButtonText: 'Confirm',
    onClose: closeMock,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Click Outside Test');

    const backdrop = await canvas.findByTestId('modal-backdrop');

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
    modalId: 'confirmation-modal',
    title: 'Enter Key Test',
    subtitle: 'This modal should confirm when pressing the Enter key.',
    confirmButtonText: 'Confirm',
    onConfirmClick: confirmMock,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Enter Key Test');

    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalledTimes(1);
    });
  },
};

export const CancelButtonClick: Story = {
  args: {
    modalId: 'confirmation-modal',
    title: 'Cancel Button Test',
    subtitle: 'Clicking the cancel button should close the modal',
    confirmButtonText: 'Confirm',
    onClose: closeMock,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Cancel Button Test');

    const cancelButton = await canvas.findByRole('button', {
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
    modalId: 'confirmation-modal',
    title: 'Confirm Button Test',
    subtitle: 'Clicking the confirm button should trigger the confirm action',
    confirmButtonText: 'Confirm',
    onConfirmClick: confirmMock,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Confirm Button Test');

    const confirmButton = await canvas.findByRole('button', {
      name: /Confirm/,
    });

    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalledTimes(1);
    });
  },
};
