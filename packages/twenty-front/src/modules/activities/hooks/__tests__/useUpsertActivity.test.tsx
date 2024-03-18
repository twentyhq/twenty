import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import gql from 'graphql-tag';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { currentNotesQueryVariablesState } from '@/activities/notes/states/currentNotesQueryVariablesState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { currentCompletedTaskQueryVariablesState } from '@/activities/tasks/states/currentCompletedTaskQueryVariablesState';
import { currentIncompleteTaskQueryVariablesState } from '@/activities/tasks/states/currentIncompleteTaskQueryVariablesState';
import { objectShowPageTargetableObjectState } from '@/activities/timeline/states/objectShowPageTargetableObjectIdState';
import { Activity } from '@/activities/types/Activity';
import { mockedActivities } from '~/testing/mock-data/activities';

const newId = 'new-id';
const activity = mockedActivities[0];
const input: Partial<Activity> = { id: newId };

const mockedDate = '2024-03-15T12:00:00.000Z';
const toISOStringMock = jest.fn(() => mockedDate);
global.Date.prototype.toISOString = toISOStringMock;

const useCreateActivityInDBMock = jest.fn();

jest.mock('@/activities/hooks/useCreateActivityInDB', () => ({
  useCreateActivityInDB: jest.fn(),
}));
(useCreateActivityInDB as jest.Mock).mockImplementation(() => ({
  createActivityInDB: useCreateActivityInDBMock,
}));

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        mutation UpdateOneActivity(
          $idToUpdate: ID!
          $input: ActivityUpdateInput!
        ) {
          updateActivity(id: $idToUpdate, data: $input) {
            __typename
            createdAt
            reminderAt
            authorId
            title
            completedAt
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
        idToUpdate: activity.id,
        input: { id: 'new-id' },
      },
    },
    result: jest.fn(() => ({
      data: {
        updateActivity: { ...activity, ...input },
      },
    })),
  },
];

const getWrapper =
  (initialIndex: 0 | 1) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter
      initialEntries={['/tasks', '/object', { pathname: '/three' }]}
      initialIndex={initialIndex}
    >
      <RecoilRoot>
        <MockedProvider mocks={mocks} addTypename={false}>
          {children}
        </MockedProvider>
      </RecoilRoot>
    </MemoryRouter>
  );

describe('useUpsertActivity', () => {
  it('updates an activity', async () => {
    const { result } = renderHook(() => useUpsertActivity(), {
      wrapper: getWrapper(0),
    });

    await act(async () => {
      await result.current.upsertActivity({
        activity,
        input,
      });
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });

  it('creates an activity on tasks page', async () => {
    const { result } = renderHook(
      () => {
        const res = useUpsertActivity();
        const setIsActivityInCreateMode = useSetRecoilState(
          isActivityInCreateModeState(),
        );

        return { ...res, setIsActivityInCreateMode };
      },
      {
        wrapper: getWrapper(0),
      },
    );

    act(() => {
      result.current.setIsActivityInCreateMode(true);
    });

    await act(async () => {
      await result.current.upsertActivity({
        activity,
        input: {},
      });
    });

    expect(useCreateActivityInDBMock).toHaveBeenCalledTimes(1);
  });

  it('creates an activity on objects page', async () => {
    const { result } = renderHook(
      () => {
        const res = useUpsertActivity();
        const setIsActivityInCreateMode = useSetRecoilState(
          isActivityInCreateModeState(),
        );
        const setObjectShowPageTargetableObject = useSetRecoilState(
          objectShowPageTargetableObjectState,
        );
        const setCurrentCompletedTaskQueryVariables = useSetRecoilState(
          currentCompletedTaskQueryVariablesState,
        );
        const setCurrentIncompleteTaskQueryVariables = useSetRecoilState(
          currentIncompleteTaskQueryVariablesState,
        );

        const setCurrentNotesQueryVariables = useSetRecoilState(
          currentNotesQueryVariablesState,
        );

        return {
          ...res,
          setIsActivityInCreateMode,
          setObjectShowPageTargetableObject,
          setCurrentCompletedTaskQueryVariables,
          setCurrentIncompleteTaskQueryVariables,
          setCurrentNotesQueryVariables,
        };
      },
      {
        wrapper: getWrapper(1),
      },
    );

    act(() => {
      result.current.setIsActivityInCreateMode(true);
      result.current.setObjectShowPageTargetableObject({
        id: '123',
        targetObjectNameSingular: 'people',
      });
      result.current.setCurrentCompletedTaskQueryVariables({});
      result.current.setCurrentIncompleteTaskQueryVariables({});
      result.current.setCurrentNotesQueryVariables({});
    });

    await act(async () => {
      await result.current.upsertActivity({
        activity,
        input: {},
      });
    });

    expect(useCreateActivityInDBMock).toHaveBeenCalledTimes(2);
  });
});
