import { Meta, StoryObj } from '@storybook/react';
import { IconTrash } from 'twenty-ui';

import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { NavigationModal } from '@/ui/navigation/action-menu/components/NavigationModal';

const meta: Meta<typeof NavigationModal> = {
  title: 'UI/Navigation/Shared/NavigationModal',
  component: NavigationModal,
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
type Story = StoryObj<typeof NavigationModal>;

export const Default: Story = {};
