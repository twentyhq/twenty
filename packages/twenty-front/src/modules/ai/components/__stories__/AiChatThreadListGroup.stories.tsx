import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatThreadListGroup } from '@/ai/components/AiChatThreadListGroup';

const meta: Meta<typeof AiChatThreadListGroup> = {
  title: 'Modules/AI/AiChatThreadListGroup',
  component: AiChatThreadListGroup,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 560 } },
};

export default meta;
type Story = StoryObj<typeof AiChatThreadListGroup>;

export const Snoozed: Story = {
  render: () => (
    <>
      <AiChatThreadListGroup title="Later today" count={1}>
        <ListItem
          startIcon={<Avatar name="Sarah Lin" size="sm" />}
          description="18:00"
          descriptionPlacement="end"
        >
          Churn risk accounts
        </ListItem>
      </AiChatThreadListGroup>
      <AiChatThreadListGroup title="Tomorrow" count={2}>
        <ListItem
          startIcon={<Avatar name="Sarah Lin" size="sm" />}
          description="09:00"
          descriptionPlacement="end"
        >
          Event sponsorship deck
        </ListItem>
        <ListItem description="09:00" descriptionPlacement="end">
          Board deck numbers
        </ListItem>
      </AiChatThreadListGroup>
      <AiChatThreadListGroup title="Until something happens" count={1}>
        <ListItem description="When Ada finishes" descriptionPlacement="end">
          Q4 forecast
        </ListItem>
      </AiChatThreadListGroup>
    </>
  ),
};

export const WithoutCount: Story = {
  args: {
    title: 'Tomorrow',
    children: (
      <ListItem description="09:00" descriptionPlacement="end">
        Board deck numbers
      </ListItem>
    ),
  },
};
