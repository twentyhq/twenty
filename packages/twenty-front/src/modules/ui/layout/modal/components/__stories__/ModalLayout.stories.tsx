import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { ModalLayout } from '@/ui/layout/modal/components/ModalLayout';

const meta: Meta<typeof ModalLayout> = {
  title: 'UI/Layout/Modal/ModalLayout',
  component: ModalLayout,
};

export default meta;
type Story = StoryObj<typeof ModalLayout>;

export const Default: Story = {
  args: {
    size: 'medium',
    padding: 'medium',
    children: (
      <>
        <ModalLayout.Header>Stay in touch</ModalLayout.Header>
        <ModalLayout.Content>
          This is a dummy newletter form so don't bother trying to test it. Not
          that I expect you to, anyways. :)
        </ModalLayout.Content>
        <ModalLayout.Footer>
          By using Twenty, you're opting for the finest CRM experience you'll
          ever encounter.
        </ModalLayout.Footer>
      </>
    ),
  },
  decorators: [ComponentDecorator],
  argTypes: {
    children: { control: false },
  },
};
