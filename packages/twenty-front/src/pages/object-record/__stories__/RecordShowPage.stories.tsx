import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPeopleData } from '~/testing/mock-data/people';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

import { RecordShowPage } from '../RecordShowPage';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/ObjectRecord/RecordShowPage',
  component: RecordShowPage,
  args: {
    routePath: '/object/:objectNameSingular/:objectRecordId',
    routeParams: {
      ':objectNameSingular': 'person',
      ':objectRecordId': '1234',
    },
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOnePerson', () => {
          return HttpResponse.json({
            data: {
              person: mockedPeopleData[0],
            },
          });
        }),
        graphql.query('FindManyActivityTargets', () => {
          return HttpResponse.json({
            data: {
              activityTargets: {
                edges: [],
                pageInfo: {
                  hasNextPage: false,
                  startCursor: '',
                  endCursor: '',
                },
                totalCount: 0,
              },
            },
          });
        }),
        graphql.query('FindOneworkspaceMember', () => {
          return HttpResponse.json({
            data: {
              workspaceMember: mockedWorkspaceMemberData,
            },
          });
        }),
        graphql.query('FindManyViews', () => {
          return HttpResponse.json({
            data: {
              views: {
                edges: [],
                pageInfo: {
                  hasNextPage: false,
                  startCursor: '1234',
                  endCursor: '1234',
                },
                totalCount: 0,
              },
            },
          });
        }),
        graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof RecordShowPage>;

export const Default: Story = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  decorators: [PageDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findAllByText('Alexandre Prot');
    await canvas.findByText('Add your first Activity');
  },
};

export const Loading: Story = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  decorators: [PageDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText('Alexandre Prot')).toBeNull();
    expect(canvas.queryByText('Add your first Activity')).toBeNull();
  },
};
