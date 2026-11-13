import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { ComponentDecorator } from 'twenty-ui/testing';

import { InboxThreadListGroup } from '@/ai/components/AiChatThreadListGroup';

const meta: Meta<typeof InboxThreadListGroup> = {
  title: 'Modules/AI/AiChatThreadListGroup',
  component: InboxThreadListGroup,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 560 } },
};

export default meta;
type Story = StoryObj<typeof InboxThreadListGroup>;

export const Snoozed: Story = {
  render: () => (
    <>
      <InboxThreadListGroup title="Later today" count={1}>
        <ListItem
          startIcon={<Avatar name="Sarah Lin" size="sm" />}
          description="18:00"
          descriptionPlacement="end"
        >
          Churn risk accounts
        </ListItem>
      </InboxThreadListGroup>
      <InboxThreadListGroup title="Tomorrow" count={2}>
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
      </InboxThreadListGroup>
      <InboxThreadListGroup title="Until something happens" count={1}>
        <ListItem description="When Ada finishes" descriptionPlacement="end">
          Q4 forecast
        </ListItem>
      </InboxThreadListGroup>
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
