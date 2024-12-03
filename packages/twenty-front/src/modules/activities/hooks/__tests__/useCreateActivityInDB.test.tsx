import { MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import gql from 'graphql-tag';
import pick from 'lodash.pick';

import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockedTasks } from '~/testing/mock-data/tasks';

const mockedDate = '2024-03-15T12:00:00.000Z';
const toISOStringMock = jest.fn(() => mockedDate);
global.Date.prototype.toISOString = toISOStringMock;

const mockedActivity = {
  ...pick(mockedTasks[0], ['id', 'title', 'body', 'type', 'status', 'dueAt']),
  updatedAt: mockedDate,
};

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        mutation CreateOneTask($input: TaskCreateInput!) {
          createTask(data: $input) {
            __typename
            assignee {
              __typename
              id
              name {
                firstName
                lastName
              }
            }
            assigneeId
            attachments {
              edges {
                node {
                  __typename
                  authorId
                  companyId
                  createdAt
                  deletedAt
                  fullPath
                  id
                  name
                  noteId
                  opportunityId
                  personId
                  rocketId
                  taskId
                  type
                  updatedAt
                }
              }
            }
            body
            createdAt
            dueAt
            id
            status
            title
            updatedAt
          }
        }
      `,
      variables: {
        input: mockedActivity,
      },
    },
    result: jest.fn(() => ({
      data: {
        createTask: {
          ...mockedActivity,
          __typename: 'Activity',
          assigneeId: '',
          authorId: '1',
          reminderAt: null,
          createdAt: mockedDate,
        },
      },
    })),
  },
];

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useCreateActivityInDB', () => {
  it('Should create activity in DB', async () => {
    const { result } = renderHook(
      () =>
        useCreateActivityInDB({
          activityObjectNameSingular: CoreObjectNameSingular.Task,
        }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      await result.current.createActivityInDB({
        ...mockedActivity,
      });
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });
});
