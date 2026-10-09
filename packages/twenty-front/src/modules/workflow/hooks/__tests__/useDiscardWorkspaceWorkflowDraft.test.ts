import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { act, renderHook } from '@testing-library/react';

import { useDiscardWorkspaceWorkflowDraft } from '@/workflow/hooks/useDiscardWorkspaceWorkflowDraft';
import { GET_WORKFLOW_VERSION_CONTENT } from '@/workflow/workflow-version/graphql/queries/getWorkflowVersionContent';

const DRAFT_VERSION_ID = '0b6b3c5e-8a0f-4d5e-9a64-6f0b7f7e3a01';
const PUBLISHED_VERSION_ID = '5d1f2c4a-3b7e-4f8a-8c2d-1e9f0a6b7c02';

let mockClient: ApolloClient;
const mockEvictDiscardedDraftFromWorkflowCache = jest.fn();

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => mockClient,
}));
jest.mock('@/workflow/hooks/useEvictDiscardedDraftFromWorkflowCache', () => ({
  useEvictDiscardedDraftFromWorkflowCache: () => ({
    evictDiscardedDraftFromWorkflowCache:
      mockEvictDiscardedDraftFromWorkflowCache,
  }),
}));

describe('useDiscardWorkspaceWorkflowDraft', () => {
  it('does not fail when the open diagram still watches the discarded draft', async () => {
    const deletedVersionIds = new Set<string>();
    const requestedContentIds: string[] = [];

    mockClient = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            if (operation.operationName === 'DiscardCoreWorkflowDraft') {
              deletedVersionIds.add(
                operation.variables.input.workspaceWorkflowVersionId,
              );
              observer.next({ data: { discardCoreWorkflowDraft: null } });
              observer.complete();
              return;
            }

            const { workflowVersionId } = operation.variables;

            requestedContentIds.push(workflowVersionId);

            if (deletedVersionIds.has(workflowVersionId)) {
              observer.next({
                errors: [{ message: 'Workflow version not found' }],
              });
              observer.complete();
              return;
            }

            observer.next({
              data: {
                workflowVersionContent: {
                  __typename: 'WorkflowVersionContent',
                  workflowVersionId,
                  trigger: null,
                  steps: [],
                },
              },
            });
            observer.complete();
          }),
      ),
    });

    const watchContent = async (workflowVersionId: string) => {
      const query = mockClient.watchQuery({
        query: GET_WORKFLOW_VERSION_CONTENT,
        variables: { workflowVersionId },
      });
      const subscription = query.subscribe({});

      await mockClient.query({
        query: GET_WORKFLOW_VERSION_CONTENT,
        variables: { workflowVersionId },
      });

      return subscription;
    };

    const draftSubscription = await watchContent(DRAFT_VERSION_ID);
    const publishedSubscription = await watchContent(PUBLISHED_VERSION_ID);
    requestedContentIds.length = 0;

    const { result } = renderHook(() => useDiscardWorkspaceWorkflowDraft());

    await act(async () => {
      await expect(
        result.current.discardWorkspaceWorkflowDraft({
          workspaceWorkflowVersionId: DRAFT_VERSION_ID,
        }),
      ).resolves.toBeUndefined();
    });

    expect(mockEvictDiscardedDraftFromWorkflowCache).toHaveBeenCalledTimes(1);
    expect(mockEvictDiscardedDraftFromWorkflowCache).toHaveBeenCalledWith(
      DRAFT_VERSION_ID,
    );
    expect(requestedContentIds).not.toContain(DRAFT_VERSION_ID);
    expect(requestedContentIds).toContain(PUBLISHED_VERSION_ID);

    draftSubscription.unsubscribe();
    publishedSubscription.unsubscribe();
    mockClient.stop();
  });
});
