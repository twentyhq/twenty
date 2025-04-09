import { Meta, StoryObj } from '@storybook/react';

import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ConfirmationModal } from '../ConfirmationModal';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof ConfirmationModal> = {
  title: 'UI/Layout/Modal/ConfirmationModal',
  component: ConfirmationModal,
  decorators: [ComponentDecorator, I18nFrontDecorator],
};
export default meta;

type Story = StoryObj<typeof ConfirmationModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Pariatur labore.',
    subtitle: 'Velit dolore aliquip laborum occaecat fugiat.',
    confirmButtonText: 'Delete',
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
