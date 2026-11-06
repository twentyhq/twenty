import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { getStepOutputSchemaFamilyStateKey } from '@/workflow/utils/getStepOutputSchemaFamilyStateKey';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { stepsOutputSchemaFamilyState } from '@/workflow/workflow-variables/states/stepsOutputSchemaFamilyState';

const mockMutate = jest.fn();
const mockClient = { mutate: mockMutate };
const mockEnqueueToast = jest.fn();
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => mockClient,
}));
jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
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
    <I18nProvider i18n={i18n}>
      <Provider store={store}>{children}</Provider>
    </I18nProvider>
  );
  const hook = renderHook(() => useStepsOutputSchema(), { wrapper });
  const schemaState = stepsOutputSchemaFamilyState.atomFamily(
    getStepOutputSchemaFamilyStateKey(version.id, 'iterator'),
  );
  return { ...hook, store, schemaState };
};

describe('useStepsOutputSchema', () => {
  beforeEach(() => jest.clearAllMocks());

  afterEach(() => {
    act(() => i18n.activate(SOURCE_LOCALE));
  });

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

  it('recomputes a cached schema after the locale changes', async () => {
    mockMutate.mockResolvedValue({
      data: { computeStepOutputSchema: outputSchema },
    });
    const { result, store, schemaState } = renderSchemas();
    act(() => result.current.populateStepsOutputSchema(version));
    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));

    act(() => result.current.populateStepsOutputSchema(version));
    expect(mockMutate).toHaveBeenCalledTimes(1);

    i18n.load('fr-FR', {});
    act(() => i18n.activate('fr-FR'));
    act(() => result.current.populateStepsOutputSchema(version));

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(store.get(schemaState)?.outputSchema).toEqual(outputSchema),
    );
  });

  it('shows the stored schema of any step until the server recomputes it', async () => {
    const storedOutputSchema = {
      success: { isLeaf: true, type: 'boolean', label: 'Success', value: true },
    };
    const recomputedOutputSchema = {
      ...storedOutputSchema,
      iCalUid: { isLeaf: true, type: 'string', label: 'iCal UID', value: '' },
    };
    let resolveRequest: (value: unknown) => void = () => {};
    mockMutate.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const calendarVersion: WorkflowVersion = {
      ...version,
      steps: [
        {
          id: 'calendar',
          name: 'Create event',
          valid: true,
          type: 'CREATE_CALENDAR_EVENT',
          settings: {
            input: {},
            outputSchema: storedOutputSchema,
            errorHandlingOptions: {
              retryOnFailure: { value: 0 },
              continueOnFailure: { value: false },
            },
          },
        } as unknown as NonNullable<WorkflowVersion['steps']>[number],
      ],
    };
    const { result, store } = renderSchemas();
    const calendarSchemaState = stepsOutputSchemaFamilyState.atomFamily(
      getStepOutputSchemaFamilyStateKey(version.id, 'calendar'),
    );

    act(() => result.current.populateStepsOutputSchema(calendarVersion));
    expect(store.get(calendarSchemaState)?.outputSchema).toEqual(
      storedOutputSchema,
    );

    await act(async () => {
      resolveRequest({
        data: { computeStepOutputSchema: recomputedOutputSchema },
      });
    });
    expect(store.get(calendarSchemaState)?.outputSchema).toEqual(
      recomputedOutputSchema,
    );
  });
});
