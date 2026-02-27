import { type MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';

import { createOneActivityOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/createOneActivityOperationSignatureFactory';
import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateCreateOneRecordMutation } from '@/object-metadata/utils/generateCreateOneRecordMutation';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockedTasks } from '~/testing/mock-data/tasks';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockedDate = '2024-03-15T12:00:00.000Z';
const toISOStringMock = jest.fn(() => mockedDate);
global.Date.prototype.toISOString = toISOStringMock;

const { id, title, bodyV2, status, dueAt } = mockedTasks[0];
const mockedActivity = {
  id,
  title,
  bodyV2,
  status,
  dueAt,
  updatedAt: mockedDate,
};

const taskMetadataItem = getMockObjectMetadataItemOrThrow('task');

const operationSignature = createOneActivityOperationSignatureFactory({
  objectNameSingular: CoreObjectNameSingular.Task,
});

const createOneTaskMutation = generateCreateOneRecordMutation({
  objectMetadataItem: taskMetadataItem,
  objectMetadataItems: generatedMockObjectMetadataItems,
  recordGqlFields: operationSignature.fields,
  objectPermissionsByObjectMetadataId: {},
});

const mockResult = jest.fn(() => ({
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
}));

const mocks: MockedResponse[] = [
  {
    request: {
      query: createOneTaskMutation,
      variables: {
        input: mockedActivity,
      },
    },
    result: mockResult,
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

    expect(mockResult).toHaveBeenCalled();
  });
});
