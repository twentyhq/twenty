import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { UIModal } from '@/ui/layout/modal/components/UIModal';

const meta: Meta<typeof UIModal> = {
  title: 'UI/Layout/Modal/UIModal',
  component: UIModal,
};

export default meta;
type Story = StoryObj<typeof UIModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    size: 'medium',
    padding: 'medium',
    children: (
      <>
        <UIModal.Header>Stay in touch</UIModal.Header>
        <UIModal.Content>
          This is a dummy newletter form so don't bother trying to test it. Not
          that I expect you to, anyways. :)
        </UIModal.Content>
        <UIModal.Footer>
          By using Twenty, you're opting for the finest CRM experience you'll
          ever encounter.
        </UIModal.Footer>
      </>
    ),
  },
  decorators: [ComponentDecorator],
  argTypes: {
    children: { control: false },
  },
};
