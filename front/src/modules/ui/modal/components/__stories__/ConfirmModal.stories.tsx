import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { ConfirmationModal } from '../ConfirmationModal';

const meta: Meta<typeof ConfirmationModal> = {
  title: 'UI/Modal/ConfirmationModal',
  component: ConfirmationModal,
  decorators: [ComponentDecorator],
};
export default meta;

type Story = StoryObj<typeof ConfirmationModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Pariatur labore.',
    subtitle: 'Velit dolore aliquip laborum occaecat fugiat.',
    deleteButtonText: 'Delete',
  },
  decorators: [ComponentDecorator],
};

export const InputConfirmation: Story = {
  args: {
    confirmationValue: 'email@test.dev',
    confirmationPlaceholder: 'email@test.dev',
    ...Default.args,
  },
  decorators: Default.decorators,
};
