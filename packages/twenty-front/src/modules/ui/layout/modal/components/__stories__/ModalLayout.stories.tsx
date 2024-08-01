import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { EnhancedModalLayout } from '@/ui/layout/modal/components/EnhancedModalLayout';

const meta: Meta<typeof EnhancedModalLayout> = {
  title: 'UI/Layout/Modal/ModalLayout',
  component: EnhancedModalLayout,
};

export default meta;
type Story = StoryObj<typeof EnhancedModalLayout>;

export const Default: Story = {
  args: {
    size: 'medium',
    padding: 'medium',
    children: (
      <>
        <EnhancedModalLayout.Header>Stay in touch</EnhancedModalLayout.Header>
        <EnhancedModalLayout.Content>
          This is a dummy newletter form so don't bother trying to test it. Not
          that I expect you to, anyways. :)
        </EnhancedModalLayout.Content>
        <EnhancedModalLayout.Footer>
          By using Twenty, you're opting for the finest CRM experience you'll
          ever encounter.
        </EnhancedModalLayout.Footer>
      </>
    ),
  },
  decorators: [ComponentDecorator],
  argTypes: {
    children: { control: false },
  },
};
