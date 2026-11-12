import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Observable, type Observer } from 'rxjs';

import { useWorkflowVersionContent } from '@/workflow/workflow-version/hooks/useWorkflowVersionContent';

const WORKFLOW_VERSION_ID = 'version';

const pendingResponses: Observer<ApolloLink.Result>[] = [];

const mockApolloCoreClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new ApolloLink(
    () =>
      new Observable((observer) => {
        pendingResponses.push(observer);
      }),
  ),
});

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => mockApolloCoreClient,
}));

const respondWithSteps = (
  response: Observer<ApolloLink.Result>,
  stepIds: string[],
) => {
  response.next({
    data: {
      coreWorkflowVersion: {
        __typename: 'CoreWorkflowVersion',
        id: WORKFLOW_VERSION_ID,
        label: 'v1',
        status: 'DRAFT',
        workspaceWorkflowVersionId: null,
        coreWorkflowId: 'workflow',
        trigger: null,
        steps: stepIds.map((id) => ({ id })),
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    },
  });
  response.complete();
};

describe('useWorkflowVersionContent', () => {
  it('refetches with its own request while an older read is still in flight', async () => {
    const { result } = renderHook(() =>
      useWorkflowVersionContent(WORKFLOW_VERSION_ID),
    );

    await waitFor(() => expect(pendingResponses).toHaveLength(1));

    let refetch: Promise<unknown> = Promise.resolve();

    act(() => {
      refetch = result.current.refetchContent();
    });

    await waitFor(() => expect(pendingResponses).toHaveLength(2));

    await act(async () => {
      respondWithSteps(pendingResponses[0], []);
      respondWithSteps(pendingResponses[1], ['step']);
      await refetch;
    });

    expect(result.current.content?.steps).toEqual([{ id: 'step' }]);
  });
});
