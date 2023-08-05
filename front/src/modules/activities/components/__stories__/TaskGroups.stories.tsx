import { getOperationName } from '@apollo/client/utilities';
import type { Meta, StoryObj } from '@storybook/react';
import { graphql } from 'msw';

import { GET_ACTIVITIES } from '@/activities/queries';
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

export const WithoutTasks: Story = {
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
