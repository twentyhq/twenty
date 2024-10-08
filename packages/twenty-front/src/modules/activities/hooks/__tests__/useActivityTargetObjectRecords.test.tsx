import { gql, InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

const cache = new InMemoryCache();

const taskTarget = {
  id: '89bb825c-171e-4bcc-9cf7-43448d6fb300',
  createdAt: '2023-04-26T10:12:42.33625+00:00',
  updatedAt: '2023-04-26T10:23:42.33625+00:00',
  companyId: null,
  company: null,
  personId: '89bb825c-171e-4bcc-9cf7-43448d6fb280',
  person: {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb280',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    city: 'City',
    name: {
      firstName: 'John',
      lastName: 'Doe',
    },
    __typename: 'Person',
  },
  taskId: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
  task: {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    dueAt: null,
    body: '{}',
    title: 'Task title',
    assigneeId: null,
    __typename: 'Task',
  },
  __typename: 'TaskTarget',
};

cache.writeFragment({
  fragment: gql`
    fragment TaskTargetFragment on TaskTarget {
      __typename
      updatedAt
      createdAt
      personId
      taskId
      companyId
      id
      task {
        __typename
        createdAt
        title
        updatedAt
        body
        dueAt
        id
        assigneeId
      }
      person {
        __typename
        id
        createdAt
        updatedAt
        city
        name {
          firstName
          lastName
        }
      }
      company {
        __typename
        id
        createdAt
        updatedAt
      }
    }
  `,
  id: `TaskTarget:${taskTarget.id}`,
  data: taskTarget,
});

const task = {
  id: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
  createdAt: '2023-04-26T10:12:42.33625+00:00',
  updatedAt: '2023-04-26T10:23:42.33625+00:00',
  title: 'Task title',
  body: null,
  assigneeId: null,
  status: null,
  dueAt: '2023-04-26T10:12:42.33625+00:00',
  assignee: null,
  __typename: 'Task' as any,
  taskTargets: [taskTarget],
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider cache={cache}>
      <JestObjectMetadataItemSetter>
        <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
          {children}
        </SnackBarProviderScope>
      </JestObjectMetadataItemSetter>
    </MockedProvider>
  </RecoilRoot>
);

describe('useActivityTargetObjectRecords', () => {
  it('return targetObjects', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        const setObjectMetadataItems = useSetRecoilState(
          objectMetadataItemsState,
        );

        const { activityTargetObjectRecords } =
          useActivityTargetObjectRecords(task);

        return {
          activityTargetObjectRecords,
          setCurrentWorkspaceMember,
          setObjectMetadataItems,
        };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.setCurrentWorkspaceMember(mockWorkspaceMembers[0]);
      result.current.setObjectMetadataItems(generatedMockObjectMetadataItems);
    });

    const activityTargetObjectRecords =
      result.current.activityTargetObjectRecords;

    expect(activityTargetObjectRecords).toHaveLength(1);
    expect(activityTargetObjectRecords[0].activityTarget).toEqual(taskTarget);
    expect(activityTargetObjectRecords[0].targetObject).toEqual(
      taskTarget.person,
    );
    expect(
      activityTargetObjectRecords[0].targetObjectMetadataItem.nameSingular,
    ).toEqual('person');
  });
});
