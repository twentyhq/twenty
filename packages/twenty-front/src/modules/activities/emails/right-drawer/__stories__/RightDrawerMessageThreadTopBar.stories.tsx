import { Meta, StoryObj } from '@storybook/react';

import { RightDrawerMessageThreadTopBar } from '@/activities/emails/right-drawer/RightDrawerMessageThreadTopBar';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof RightDrawerMessageThreadTopBar> = {
  title: 'Modules/Activities/Emails/RightDrawer/RightDrawerMessageThreadTopBar',
  component: RightDrawerMessageThreadTopBar,
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
type Story = StoryObj<typeof RightDrawerMessageThreadTopBar>;

export const Default: Story = {};
