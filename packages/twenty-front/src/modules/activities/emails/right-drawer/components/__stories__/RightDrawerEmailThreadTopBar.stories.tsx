import { Meta, StoryObj } from '@storybook/react';

import { RightDrawerEmailThreadTopBar } from '@/activities/emails/right-drawer/components/RightDrawerEmailThreadTopBar';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof RightDrawerEmailThreadTopBar> = {
  title: 'Modules/Activities/Emails/RightDrawer/RightDrawerEmailThreadTopBar',
  component: RightDrawerEmailThreadTopBar,
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
    ComponentDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RightDrawerEmailThreadTopBar>;

export const Default: Story = {};
