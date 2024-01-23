import { Meta, StoryObj } from '@storybook/react';

import { RightDrawerThreadTopBar } from '@/activities/emails/right-drawer/RightDrawerThreadTopBar';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof RightDrawerThreadTopBar> = {
  title: 'Modules/Activities/Emails/RightDrawer/RightDrawerThreadTopBar',
  component: RightDrawerThreadTopBar,
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
type Story = StoryObj<typeof RightDrawerThreadTopBar>;

export const Default: Story = {};
