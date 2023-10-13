import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { Modal } from '../Modal';
import { ModalHotkeyScope } from '../types/ModalHotkeyScope';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal/Modal',
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    isOpen: true,
    size: 'medium',
    padding: 'medium',
    hotkeyScope: ModalHotkeyScope.Default,
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
  decorators: [ComponentDecorator],
  argTypes: {
    children: { control: false },
  },
};
