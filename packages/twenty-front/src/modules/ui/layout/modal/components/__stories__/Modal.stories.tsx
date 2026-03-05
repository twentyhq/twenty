import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { ComponentDecorator } from 'twenty-ui/testing';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { sleep } from '~/utils/sleep';

const JotaiInitDecorator: Decorator = (Story) => {
  jotaiStore.set(
    isModalOpenedComponentState.atomFamily({
      instanceId: 'modal-id',
    }),
    true,
  );
  jotaiStore.set(focusStackState.atom, [
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
  return <Story />;
};

const meta: Meta<typeof ModalStatefulWrapper> = {
  title: 'UI/Layout/Modal/ModalStatefulWrapper',
  component: ModalStatefulWrapper,
  decorators: [JotaiInitDecorator, RootDecorator, ComponentDecorator],
  parameters: {
    disableHotkeyInitialization: true,
  },
};

export default meta;
type Story = StoryObj<typeof ModalStatefulWrapper>;

const closeMock = fn();

export const Default: Story = {
  args: {
    modalInstanceId: 'modal-id',
    size: 'medium',
    padding: 'medium',
    children: (
      <>
        <ModalHeader>Stay in touch</ModalHeader>
        <ModalContent>
          This is a dummy newletter form so don't bother trying to test it. Not
          that I expect you to, anyways. :)
        </ModalContent>
        <ModalFooter>
          By using Twenty, you're opting for the finest CRM experience you'll
          ever encounter.
        </ModalFooter>
      </>
    ),
  },
};

export const CloseClosableModalOnClickOutside: Story = {
  args: {
    modalInstanceId: 'modal-id',
    size: 'medium',
    padding: 'medium',
    isClosable: true,
    onClose: closeMock,
    children: (
      <>
        <ModalHeader>Click Outside Test</ModalHeader>
        <ModalContent>
          This modal should close when clicking outside of it.
        </ModalContent>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Click Outside Test');

    const backdrop = await canvas.findByTestId('modal-backdrop');
    await sleep(100);
    await userEvent.click(backdrop);

    await waitFor(() => {
      expect(closeMock).toHaveBeenCalledTimes(1);
    });
  },
};

export const CloseClosableModalOnEscape: Story = {
  args: {
    modalInstanceId: 'modal-id',
    size: 'medium',
    padding: 'medium',
    isClosable: true,
    onClose: closeMock,
    children: (
      <>
        <ModalHeader>Escape Key Test</ModalHeader>
        <ModalContent>
          This modal should close when pressing the Escape key.
        </ModalContent>
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
