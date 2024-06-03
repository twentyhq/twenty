import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { RightDrawerTopBar } from '../RightDrawerTopBar';

const meta: Meta<typeof RightDrawerTopBar> = {
  title: 'Modules/Activities/RightDrawer/RightDrawerActivityTopBar',
  component: RightDrawerTopBar,
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
type Story = StoryObj<typeof RightDrawerTopBar>;

export const Default: Story = {};
