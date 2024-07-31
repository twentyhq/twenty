import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot, useRecoilValue, useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import gql from 'graphql-tag';
import pick from 'lodash.pick';
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

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false} mocks={mocks}>
      {children}
    </MockedProvider>
  </RecoilRoot>
);

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('useOpenCreateActivityDrawer', () => {
  it('works as expected', async () => {
    const { result } = renderHook(
      () => {
        const openActivityRightDrawer = useOpenCreateActivityDrawer({
          activityObjectNameSingular: CoreObjectNameSingular.Note,
        });
        const viewableRecordId = useRecoilValue(viewableRecordIdState);
        const setObjectMetadataItems = useSetRecoilState(
          objectMetadataItemsState,
        );
        return {
          openActivityRightDrawer,
          viewableRecordId,
          setObjectMetadataItems,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.setObjectMetadataItems(mockObjectMetadataItems);
    });

    expect(result.current.viewableRecordId).toBeNull();
    await act(async () => {
      result.current.openActivityRightDrawer({
        targetableObjects: [],
      });
    });
  });
});
