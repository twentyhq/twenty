import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { getStepOutputSchemaFamilyStateKey } from '@/workflow/utils/getStepOutputSchemaFamilyStateKey';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { stepsOutputSchemaFamilyState } from '@/workflow/workflow-variables/states/stepsOutputSchemaFamilyState';

const mockMutate = jest.fn();
const mockClient = { mutate: mockMutate };
const mockEnqueueErrorSnackBar = jest.fn();
jest.mock('@/workflow/hooks/useIsWorkflowCoreEnabled', () => ({
  useIsWorkflowCoreEnabled: () => true,
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => mockClient,
}));
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueErrorSnackBar: mockEnqueueErrorSnackBar }),
}));

const version: WorkflowVersion = {
  __typename: 'WorkflowVersion',
  id: 'core-version',
  workflowId: 'core-workflow',
  name: 'v1',
  status: 'DRAFT',
  createdAt: '2026-09-16T00:00:00Z',
  updatedAt: '2026-09-16T00:00:00Z',
  trigger: null,
  steps: [
    {
      id: 'iterator',
      name: 'Loop',
      valid: true,
      type: 'ITERATOR',
      settings: {
        input: { items: ['item'] },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: false },
        },
      },
    },
  ],
};
const outputSchema = {
  currentItem: { isLeaf: true, type: 'string', label: 'Item', value: 'item' },
};

const renderSchemas = () => {
  const store = createStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(() => useStepsOutputSchema(), { wrapper });
  const schemaState = stepsOutputSchemaFamilyState.atomFamily(
    getStepOutputSchemaFamilyStateKey(version.id, 'iterator'),
  );
  return { ...hook, store, schemaState };
};

describe('core iterator output schema', () => {
  beforeEach(() => jest.clearAllMocks());

  it('computes the iterator schema with the core version context', async () => {
    mockMutate.mockResolvedValue({
      data: { computeStepOutputSchema: outputSchema },
    });
    const { result, store, schemaState } = renderSchemas();
    act(() => result.current.populateStepsOutputSchema(version));
    await waitFor(() =>
      expect(store.get(schemaState)?.outputSchema).toEqual(outputSchema),
    );
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            coreWorkflowVersionId: 'core-version',
            step: version.steps?.[0],
          },
        },
      }),
    );
  });

  it('ignores a schema response after the step was deleted', async () => {
    let resolveRequest: (value: unknown) => void = () => {};
    mockMutate.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const { result, store, schemaState } = renderSchemas();
    act(() => result.current.populateStepsOutputSchema(version));
    act(() =>
      result.current.deleteStepsOutputSchema({
        workflowVersionId: version.id,
        stepIds: ['iterator'],
      }),
    );
    await act(async () => {
      resolveRequest({ data: { computeStepOutputSchema: outputSchema } });
    });
    expect(store.get(schemaState)).toBeNull();
  });
});
