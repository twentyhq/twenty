import type { Meta, StoryObj } from '@storybook/react';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof TaskGroups> = {
  title: 'Modules/Activity/TaskGroups',
  component: TaskGroups,
  decorators: [ComponentWithRouterDecorator, ComponentWithRecoilScopeDecorator],
  parameters: {
    msw: graphqlMocks,
    customRecoilScopeContext: TasksRecoilScopeContext,
  },
};

export default meta;
type Story = StoryObj<typeof TaskGroups>;

export const Default: Story = {};
