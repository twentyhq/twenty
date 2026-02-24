import { type MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import gql from 'graphql-tag';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockedTasks } from '~/testing/mock-data/tasks';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

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

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        mutation CreateOneActivity($input: ActivityCreateInput!) {
          createActivity(data: $input) {
            __typename
            createdAt
            reminderAt
            authorId
            title
            status
            updatedAt
            body
            dueAt
            type
            id
            assigneeId
          }
        }
      `,
      variables: {
        input: mockedActivity,
      },
    },
    result: jest.fn(() => ({
      data: {
        createActivity: {
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

const mockObjectMetadataItems = generatedMockObjectMetadataItems;

describe('useOpenCreateActivityDrawer', () => {
  beforeEach(() => {
    jotaiStore.set(objectMetadataItemsState.atom, mockObjectMetadataItems);
  });

  it('works as expected', async () => {
    const { result } = renderHook(
      () => {
        const openActivityRightDrawer = useOpenCreateActivityDrawer({
          activityObjectNameSingular: CoreObjectNameSingular.Note,
        });
        const viewableRecordId = useRecoilValueV2(viewableRecordIdState);
        return {
          openActivityRightDrawer,
          viewableRecordId,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.viewableRecordId).toBeNull();
    await act(async () => {
      result.current.openActivityRightDrawer({
        targetableObjects: [],
      });
    });
  });
});
