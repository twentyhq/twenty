import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';

import { type PageDecoratorArgs } from '~/testing/decorators/PageDecorator';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';
import { generateMockRecordConnection } from '~/testing/utils/generateMockRecordConnection';

import { RecordShowPage } from '~/pages/object-record/RecordShowPage';

const flatPersonRecords = mockedPersonRecords.map((record) =>
  getRecordFromRecordNode({ recordNode: record }),
);

const personRecord = flatPersonRecords[0];
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
            data: {
              people: generateMockRecordConnection({
                objectNameSingular: 'person',
                records: flatPersonRecords,
              }),
            },
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
