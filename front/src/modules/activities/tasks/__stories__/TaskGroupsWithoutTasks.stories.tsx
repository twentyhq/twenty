import { getOperationName } from '@apollo/client/utilities';
import { Meta, StoryObj } from '@storybook/react';
import { graphql } from 'msw';

import { GET_ACTIVITIES } from '@/activities/graphql/queries/getActivities';
import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof TaskGroups> = {
  title: 'Modules/Activity/TaskGroupsWithoutTasks',
  component: TaskGroups,
  decorators: [ComponentWithRouterDecorator, ComponentWithRecoilScopeDecorator],
  parameters: {
    msw: graphqlMocks,
    customRecoilScopeContext: TasksRecoilScopeContext,
  },
};

export default meta;
type Story = StoryObj<typeof TaskGroups>;

export const Default: Story = {
  parameters: {
    msw: [
      ...graphqlMocks.filter(
        (graphqlMock) =>
          graphqlMock.info.operationName !== getOperationName(GET_ACTIVITIES),
      ),
      ...[
        graphql.query(
          getOperationName(GET_ACTIVITIES) ?? '',
          (_req, res, ctx) => {
            return res(
              ctx.data({
                findManyActivities: [],
              }),
            );
          },
        ),
      ],
    ],
  },
};
