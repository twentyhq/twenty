import { ReactNode } from 'react';
import { gql, InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

const mockObjectMetadataItems = getObjectMetadataItemsMock();

const cache = new InMemoryCache();

const activityNode = {
  id: '3ecaa1be-aac7-463a-a38e-64078dd451d5',
  createdAt: '2023-04-26T10:12:42.33625+00:00',
  updatedAt: '2023-04-26T10:23:42.33625+00:00',
  reminderAt: null,
  title: 'My very first note',
  type: 'Note',
  body: '',
  dueAt: '2023-04-26T10:12:42.33625+00:00',
  completedAt: null,
  author: null,
  assignee: null,
  assigneeId: null,
  authorId: null,
  comments: {
    edges: [],
  },
  activityTargets: {
    edges: [
      {
        node: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb300',
          createdAt: '2023-04-26T10:12:42.33625+00:00',
          updatedAt: '2023-04-26T10:23:42.33625+00:00',
          personId: null,
          companyId: '89bb825c-171e-4bcc-9cf7-43448d6fb280',
          company: {
            id: '89bb825c-171e-4bcc-9cf7-43448d6fb280',
            name: 'Airbnb',
            domainName: 'airbnb.com',
          },
          person: null,
          activityId: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
          activity: {
            id: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
            createdAt: '2023-04-26T10:12:42.33625+00:00',
            updatedAt: '2023-04-26T10:23:42.33625+00:00',
          },
          __typename: 'ActivityTarget',
        },
        __typename: 'ActivityTargetEdge',
      },
    ],
    __typename: 'ActivityTargetConnection',
  },
  __typename: 'Activity' as const,
};

cache.writeFragment({
  fragment: gql`
    fragment CreateOneActivityInCache on Activity {
      id
      createdAt
      updatedAt
      reminderAt
      title
      body
      dueAt
      completedAt
      author
      assignee
      assigneeId
      authorId
      activityTargets {
        edges {
          node {
            id
            createdAt
            updatedAt
            targetObjectNameSingular
            personId
            companyId
            company {
              id
              name
              domainName
            }
            person
            activityId
            activity {
              id
              createdAt
              updatedAt
            }
            __typename
          }
        }
      }
      __typename
    }
  `,
  id: activityNode.id,
  data: activityNode,
});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider cache={cache}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        {children}
      </SnackBarProviderScope>
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

        const { activityTargetObjectRecords } = useActivityTargetObjectRecords(
          getRecordFromRecordNode({ recordNode: activityNode as any }),
        );

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
      result.current.setObjectMetadataItems(mockObjectMetadataItems);
    });
    const activityTargetObjectRecords =
      result.current.activityTargetObjectRecords;

    expect(activityTargetObjectRecords).toHaveLength(1);
    expect(activityTargetObjectRecords[0].activityTarget).toEqual(
      activityNode.activityTargets.edges[0].node,
    );
    expect(activityTargetObjectRecords[0].targetObject).toEqual(
      activityNode.activityTargets.edges[0].node.company,
    );
    expect(
      activityTargetObjectRecords[0].targetObjectMetadataItem.nameSingular,
    ).toEqual('company');
  });
});
