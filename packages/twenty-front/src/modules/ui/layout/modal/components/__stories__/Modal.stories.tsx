import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { ComponentDecorator } from 'twenty-ui/testing';
import { isModalOpenedComponentState } from '../../states/isModalOpenedComponentState';
import { Modal } from '../Modal';

const meta: Meta<typeof Modal> = {
  title: 'UI/Layout/Modal/Modal',
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

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
  decorators: [
    (Story, context) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(
            isModalOpenedComponentState.atomFamily({
              instanceId: context.args.modalId,
            }),
            true,
          );
        }}
      >
        <Story />
      </RecoilRoot>
    ),
    ComponentDecorator,
  ],
  argTypes: {
    children: { control: false },
  },
};
