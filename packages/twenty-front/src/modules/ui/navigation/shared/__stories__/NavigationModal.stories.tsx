import { Meta, StoryObj } from '@storybook/react';
import { IconTrash } from 'twenty-ui';

import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import SharedNavigationModal from '@/ui/navigation/shared/components/NavigationModal';

const meta: Meta<typeof SharedNavigationModal> = {
  title: 'UI/Navigation/Shared/SharedNavigationModal',
  component: SharedNavigationModal,
  args: {
    actionBarEntries: [
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
    customClassName: 'customClassName',
  },
};

export default meta;
type Story = StoryObj<typeof SharedNavigationModal>;

export const Default: Story = {};
