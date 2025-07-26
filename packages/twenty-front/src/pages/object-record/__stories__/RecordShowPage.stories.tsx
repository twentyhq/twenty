import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { HttpResponse, graphql } from 'msw';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  allMockPersonRecords,
  peopleQueryResult,
} from '~/testing/mock-data/people';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { RecordShowPage } from '../RecordShowPage';

const personRecord = allMockPersonRecords[0];
const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/ObjectRecord/RecordShowPage',
  component: RecordShowPage,
  args: {
    routePath: '/object/:objectNameSingular/:objectRecordId',
    routeParams: {
      ':objectNameSingular': 'person',
      ':objectRecordId': personRecord.id,
    },
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindManyPeople', () => {
          return HttpResponse.json({
            data: peopleQueryResult,
          });
        }),
        graphql.query('FindOnePerson', () => {
          return HttpResponse.json({
            data: {
              person: personRecord,
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
  decorators: [PageDecorator, ContextStoreDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // await canvas.findAllByText(peopleMock[0].name.firstName);
    expect(
      await canvas.findByText('Twenty', undefined, {
        timeout: 5000,
      }),
    ).toBeInTheDocument();
    expect(
      await canvas.findByText('No activity yet', undefined, {
        timeout: 5000,
      }),
    ).toBeInTheDocument();
  },
};
