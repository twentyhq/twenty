import { gql, InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { Provider as JotaiProvider } from 'jotai';

import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const cache = new InMemoryCache();

const taskTarget = {
  id: '89bb825c-171e-4bcc-9cf7-43448d6fb300',
  createdAt: '2023-04-26T10:12:42.33625+00:00',
  updatedAt: '2023-04-26T10:23:42.33625+00:00',
  targetCompanyId: null,
  targetCompany: null,
  targetPersonId: '89bb825c-171e-4bcc-9cf7-43448d6fb280',
  targetPerson: {
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
    bodyV2: {
      blocknote: '',
      markdown: '',
    },
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
      targetPersonId
      taskId
      targetCompanyId
      id
      task {
        __typename
        createdAt
        title
        updatedAt
        bodyV2 {
          blocknote
          markdown
        }
        dueAt
        id
        assigneeId
      }
      targetPerson {
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
      targetCompany {
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
  bodyV2: {
    blocknote: null,
    markdown: null,
  },
  assigneeId: null,
  status: null,
  dueAt: '2023-04-26T10:12:42.33625+00:00',
  assignee: null,
  __typename: 'Task' as any,
  taskTargets: [taskTarget],
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <MockedProvider cache={cache}>
      <JestObjectMetadataItemSetter>
        <SnackBarComponentInstanceContext.Provider
          value={{ instanceId: 'snack-bar-manager' }}
        >
          {children}
        </SnackBarComponentInstanceContext.Provider>
      </JestObjectMetadataItemSetter>
    </MockedProvider>
  </JotaiProvider>
);

describe('useActivityTargetObjectRecords', () => {
  it('return targetObjects', async () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, mockWorkspaceMembers[0]);

    jotaiStore.set(
      objectMetadataItemsState.atom,
      generatedMockObjectMetadataItems,
    );

    const { result } = renderHook(
      () => {
        const setRecordFromStore = useSetAtomFamilyState(
          recordStoreFamilyState,
          task.id,
        );

        const { activityTargetObjectRecords } = useActivityTargetObjectRecords(
          task.id,
        );

        return {
          activityTargetObjectRecords,
          setRecordFromStore,
        };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.setRecordFromStore(task);
    });

    const activityTargetObjectRecords =
      result.current.activityTargetObjectRecords;

    expect(activityTargetObjectRecords).toHaveLength(1);
    expect(activityTargetObjectRecords[0].activityTarget).toEqual(taskTarget);
    expect(activityTargetObjectRecords[0].targetObject).toEqual(
      taskTarget.targetPerson,
    );
    expect(
      activityTargetObjectRecords[0].targetObjectMetadataItem.nameSingular,
    ).toEqual('person');
  });
});
