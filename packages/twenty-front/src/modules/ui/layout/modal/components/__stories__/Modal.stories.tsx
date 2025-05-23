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
import { Modal } from '../Modal';

const initializeState = ({ set }: { set: (atom: any, value: any) => void }) => {
  set(
    isModalOpenedComponentState.atomFamily({
      instanceId: 'modal-id',
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
      focusId: 'modal-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'modal-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    },
  ]);
};

const meta: Meta<typeof Modal> = {
  title: 'UI/Layout/Modal/Modal',
  component: Modal,
  decorators: [I18nFrontDecorator, RootDecorator, ComponentDecorator],
  parameters: {
    initializeState,
    disableHotkeyInitialization: true,
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const closeMock = fn();

export const Default: Story = {
  args: {
    modalId: 'modal-id',
    size: 'medium',
    padding: 'medium',
    children: (
      <>
        <Modal.Header>Stay in touch</Modal.Header>
        <Modal.Content>
          This is a dummy newletter form so don't bother trying to test it. Not
          that I expect you to, anyways. :)
        </Modal.Content>
        <Modal.Footer>
          By using Twenty, you're opting for the finest CRM experience you'll
          ever encounter.
        </Modal.Footer>
      </>
    ),
  },
};

export const CloseClosableModalOnClickOutside: Story = {
  args: {
    modalId: 'modal-id',
    size: 'medium',
    padding: 'medium',
    isClosable: true,
    onClose: closeMock,
    children: (
      <>
        <Modal.Header>Click Outside Test</Modal.Header>
        <Modal.Content>
          This modal should close when clicking outside of it.
        </Modal.Content>
      </>
    ),
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

export const CloseClosableModalOnEscape: Story = {
  args: {
    modalId: 'modal-id',
    size: 'medium',
    padding: 'medium',
    isClosable: true,
    onClose: closeMock,
    children: (
      <>
        <Modal.Header>Escape Key Test</Modal.Header>
        <Modal.Content>
          This modal should close when pressing the Escape key.
        </Modal.Content>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Escape Key Test');

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(closeMock).toHaveBeenCalledTimes(1);
    });
  },
};
