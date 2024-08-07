import { Modal } from '@/ui/layout/modal/components/Modal';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

const meta: Meta<typeof Modal> = {
  title: 'UI/Layout/Modal/ModalLayout',
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
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
  decorators: [ComponentDecorator],
  argTypes: {
    children: { control: false },
  },
};
