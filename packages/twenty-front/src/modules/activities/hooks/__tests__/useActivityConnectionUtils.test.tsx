import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useActivityConnectionUtils } from '@/activities/hooks/useActivityConnectionUtils';
import { Comment } from '@/activities/types/Comment';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';

const mockActivityWithConnectionRelation = {
  activityTargets: {
    edges: [
      {
        __typename: 'ActivityTargetEdge',
        node: {
          id: '20202020-1029-4661-9e91-83bad932bdff',
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  },
  comments: {
    edges: [
      {
        __typename: 'CommentEdge',
        node: {
          id: '20202020-1029-4661-9e91-83bad932bdee',
        },
      },
    ] as ObjectRecordEdge<Comment>[],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  },
};

const mockActivityWithArrayRelation = {
  activityTargets: [
    {
      id: '20202020-1029-4661-9e91-83bad932bdff',
    },
  ],
  comments: [
    {
      id: '20202020-1029-4661-9e91-83bad932bdee',
    },
  ],
};

describe('useActivityConnectionUtils', () => {
  it('Should turn activity with connection relation in activity with array relation', async () => {
    const { result } = renderHook(() => useActivityConnectionUtils(), {
      wrapper: ({ children }) => (
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(
              objectMetadataItemsState(),
              getObjectMetadataItemsMock(),
            );
          }}
        >
          {children}
        </RecoilRoot>
      ),
    });

    const { makeActivityWithoutConnection } = result.current;

    const { activity: activityWithArrayRelation } =
      makeActivityWithoutConnection(mockActivityWithConnectionRelation as any);

    expect(activityWithArrayRelation).toBeDefined();

    expect(activityWithArrayRelation.activityTargets[0].id).toEqual(
      mockActivityWithArrayRelation.activityTargets[0].id,
    );
  });

  it('Should turn activity with connection relation in activity with array relation', async () => {
    const { result } = renderHook(() => useActivityConnectionUtils(), {
      wrapper: ({ children }) => (
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(
              objectMetadataItemsState(),
              getObjectMetadataItemsMock(),
            );
          }}
        >
          {children}
        </RecoilRoot>
      ),
    });

    const { makeActivityWithConnection } = result.current;

    const { activityWithConnection } = makeActivityWithConnection(
      mockActivityWithArrayRelation as any,
    );

    expect(activityWithConnection).toBeDefined();

    expect(activityWithConnection.activityTargets.edges[0].node.id).toEqual(
      mockActivityWithConnectionRelation.activityTargets.edges[0].node.id,
    );
  });
});
