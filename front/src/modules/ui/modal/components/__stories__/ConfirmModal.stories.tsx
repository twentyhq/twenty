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

const defaultArgs = {
  isOpen: true,
  title: 'Pariatur labore.',
  subtitle: 'Velit dolore aliquip laborum occaecat fugiat.',
  deleteButtonText: 'Delete',
};

export const Default: Story = {
  args: defaultArgs,
  decorators: [ComponentDecorator],
};

export const InputConfirmation: Story = {
  args: {
    confirmationValue: 'email@test.dev',
    confirmationPlaceholder: 'email@test.dev',
    ...defaultArgs,
  },
  decorators: [ComponentDecorator],
};
