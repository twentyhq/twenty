import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { internalHotkeysEnabledScopesState } from '@/ui/utilities/hotkey/states/internal/internalHotkeysEnabledScopesState';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
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

    expect(closeMock).toHaveBeenCalledTimes(1);
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

    closeMock.mockClear();

    const backdrop = document.querySelector('.modal-backdrop') as HTMLElement;
    await userEvent.click(backdrop);

    expect(closeMock).toHaveBeenCalledTimes(1);
  },
};

export const ConfirmWithEnterKey: Story = {
  args: {
    modalId: 'confirmation-modal',
    title: 'Enter Key Test',
    subtitle: 'This modal should confirm when pressing the Enter key.',
    confirmButtonText: 'Confirm',
    onConfirmClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Enter Key Test');

    const confirmMock = args.onConfirmClick as ReturnType<typeof fn>;
    confirmMock.mockClear();

    await userEvent.keyboard('{Enter}');

    expect(confirmMock).toHaveBeenCalledTimes(1);
  },
};
