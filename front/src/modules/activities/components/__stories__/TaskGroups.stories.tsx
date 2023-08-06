import type { Meta, StoryObj } from '@storybook/react';

import { TasksContext } from '@/activities/states/TasksContext';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { TaskGroups } from '../TaskGroups';

const meta: Meta<typeof TaskGroups> = {
  title: 'Modules/Activity/TaskGroups',
  component: TaskGroups,
  decorators: [ComponentWithRouterDecorator, ComponentWithRecoilScopeDecorator],
  parameters: {
    msw: graphqlMocks,
    recoilScopeContext: TasksContext,
  },
};

export default meta;
type Story = StoryObj<typeof TaskGroups>;

export const Default: Story = {};
