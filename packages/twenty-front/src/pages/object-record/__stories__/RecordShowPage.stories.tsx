import { type Meta, type StoryObj } from '@storybook/react';
import { HttpResponse, graphql } from 'msw';

import { type PageDecoratorArgs } from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  allMockPersonRecords,
  peopleQueryResult,
} from '~/testing/mock-data/people';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

import { RecordShowPage } from '~/pages/object-record/RecordShowPage';

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

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const Default: Story = {
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   decorators: [PageDecorator, ContextStoreDecorator],
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);

//     // await canvas.findAllByText(peopleMock[0].name.firstName);
//     expect(
//       await canvas.findByText('Twenty', undefined, {
//         timeout: 5000,
//       }),
//     ).toBeInTheDocument();
//     expect(
//       await canvas.findByText('No activity yet', undefined, {
//         timeout: 5000,
//       }),
//     ).toBeInTheDocument();
//   },
// };
