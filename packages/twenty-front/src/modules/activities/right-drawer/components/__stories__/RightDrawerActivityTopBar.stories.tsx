import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { RightDrawerActivityTopBar } from '../RightDrawerActivityTopBar';

const meta: Meta<typeof RightDrawerActivityTopBar> = {
  title: 'Modules/Activities/RightDrawer/RightDrawerActivityTopBar',
  component: RightDrawerActivityTopBar,
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
    ComponentWithRouterDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RightDrawerActivityTopBar>;

export const Default: Story = {};
