import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { act, render, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { shouldWorkflowRefetchRequestFamilyState } from '@/workflow/states/shouldWorkflowRefetchRequestFamilyState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

jest.mock('@/object-metadata/hooks/useApolloCoreClient');
jest.mock('@/workflow/hooks/useWorkflowWithCurrentVersion');
jest.mock('@/workflow/hooks/useIsWorkflowCoreEnabled', () => ({
  useIsWorkflowCoreEnabled: jest.fn(),
}));
jest.mock('@/workflow/workflow-variables/hooks/useStepsOutputSchema', () => ({
  useStepsOutputSchema: () => ({
    populateStepsOutputSchema: jest.fn(),
    deleteStepsOutputSchema: jest.fn(),
  }),
}));

const WORKFLOW_ID = '8c9a3708-5674-4e1b-a9b9-4f0dacb26c15';
const VERSION_ID = 'ad098e99-9319-4a59-bce7-97784cb00452';
const INSTANCE_ID = 'workflow-refetch-test';
const WORKFLOW: WorkflowWithCurrentVersion = {
  __typename: 'Workflow',
  id: WORKFLOW_ID,
  name: 'Test workflow',
  versions: [],
  lastPublishedVersionId: null,
  statuses: ['DRAFT'],
  currentVersion: {
    __typename: 'WorkflowVersion',
    id: VERSION_ID,
    workflowId: WORKFLOW_ID,
    name: 'Draft',
    status: 'DRAFT',
    createdAt: '2026-09-22T00:00:00Z',
    updatedAt: '2026-09-22T00:00:00Z',
    trigger: null,
    steps: [],
  },
};

describe('WorkflowDiagramEffect', () => {
  it.each([true, false])(
    'keeps a live refresh pending until the current version is available (core: %s)',
    async (isCore) => {
      const requestedIds: (string | undefined)[] = [];
      const client = new ApolloClient({
        cache: new InMemoryCache(),
        link: new ApolloLink(
          (operation) =>
            new Observable((observer) => {
              requestedIds.push(
                isCore
                  ? operation.variables.coreWorkflowVersionId
                  : operation.variables.workflowVersionId,
              );
              observer.next({
                data: isCore
                  ? { coreWorkflowVersion: null }
                  : { workflowVersionContent: null },
              });
              observer.complete();
            }),
        ),
      });
      jest.mocked(useApolloCoreClient).mockReturnValue(client);
      jest.mocked(useIsWorkflowCoreEnabled).mockReturnValue(isCore);
      jest.mocked(useWorkflowWithCurrentVersion).mockReturnValue(undefined);

      const store = createStore();
      const refreshAtom =
        shouldWorkflowRefetchRequestFamilyState.atomFamily(WORKFLOW_ID);
      store.set(
        workflowVisualizerWorkflowIdComponentState.atomFamily({
          instanceId: INSTANCE_ID,
        }),
        WORKFLOW_ID,
      );
      store.set(refreshAtom, true);

      const Wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <WorkflowVisualizerComponentInstanceContext.Provider
            value={{ instanceId: INSTANCE_ID }}
          >
            {children}
          </WorkflowVisualizerComponentInstanceContext.Provider>
        </Provider>
      );
      const { rerender, unmount } = render(<WorkflowDiagramEffect />, {
        wrapper: Wrapper,
      });
      await act(async () => {});

      expect(requestedIds).toEqual([]);
      expect(store.get(refreshAtom)).toBe(true);

      jest.mocked(useWorkflowWithCurrentVersion).mockReturnValue(WORKFLOW);
      rerender(<WorkflowDiagramEffect />);
      await waitFor(() => {
        expect(requestedIds).toContain(VERSION_ID);
        expect(store.get(refreshAtom)).toBe(false);
      });
      expect(requestedIds).not.toContain('');
      expect(requestedIds).not.toContain(undefined);

      unmount();
      client.stop();
    },
  );
});
