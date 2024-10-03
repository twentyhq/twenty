import { Meta, StoryObj } from '@storybook/react';
import { IconTrash } from 'twenty-ui';

import { ActionMenuNavigationModal } from '@/action-menu/components/NavigationModal';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';

const meta: Meta<typeof ActionMenuNavigationModal> = {
  title: 'UI/Navigation/Shared/NavigationModal',
  component: ActionMenuNavigationModal,
  args: {
    actionMenuEntries: [
      {
        ConfirmationModal: (
          <ConfirmationModal
            title="Title"
            deleteButtonText="Delete"
            onConfirmClick={() => {}}
            setIsOpen={() => {}}
            isOpen={false}
            subtitle="Subtitle"
          />
        ),
        Icon: IconTrash,
        label: 'Label',
        onClick: () => {},
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof ActionMenuNavigationModal>;

export const Default: Story = {};
