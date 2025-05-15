import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { isModalOpenedComponentState } from '../../states/isModalOpenedComponentState';
import { ConfirmationModal } from '../ConfirmationModal';

const meta: Meta<typeof ConfirmationModal> = {
  title: 'UI/Layout/Modal/ConfirmationModal',
  component: ConfirmationModal,
  decorators: [ComponentDecorator, I18nFrontDecorator],
};
export default meta;

type Story = StoryObj<typeof ConfirmationModal>;

export const Default: Story = {
  args: {
    modalId: 'confirmation-modal',
    title: 'Pariatur labore.',
    subtitle: 'Velit dolore aliquip laborum occaecat fugiat.',
    confirmButtonText: 'Delete',
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
};

export const InputConfirmation: Story = {
  args: {
    confirmationValue: 'email@test.dev',
    confirmationPlaceholder: 'email@test.dev',
    ...Default.args,
  },
  decorators: Default.decorators,
};
