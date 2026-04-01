import { type HeadlessEngineCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation } from '@/command-menu-item/engine-command/hooks/useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation';
import { renderHook, act } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

const mockFindOneWorkflowVersion = jest.fn();
const mockEnqueueWarningSnackBar = jest.fn();
const mockBuildTriggerWorkflowVersionPayloads = jest.fn();

jest.mock('@/object-record/hooks/useLazyFindOneRecord', () => ({
  useLazyFindOneRecord: () => ({
    findOneRecord: mockFindOneWorkflowVersion,
  }),
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueWarningSnackBar: mockEnqueueWarningSnackBar,
  }),
}));

jest.mock(
  '@/command-menu-item/engine-command/utils/buildTriggerWorkflowVersionPayloads',
  () => ({
    buildTriggerWorkflowVersionPayloads: (...args: unknown[]) =>
      mockBuildTriggerWorkflowVersionPayloads(...args),
  }),
);

const getWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

const buildBaseContextApi = (
  overrides: Partial<HeadlessEngineCommandContextApi> = {},
): HeadlessEngineCommandContextApi => ({
  engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
  contextStoreInstanceId: 'ctx-1',
  objectMetadataItem: null,
  currentViewId: null,
  recordIndexId: null,
  targetedRecordsRule: { mode: 'selection', selectedRecordIds: [] },
  selectedRecords: [],
  graphqlFilter: null,
  ...overrides,
});

describe('useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return enriched context API with workflow info and payloads', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const workflowVersionRecord = {
      id: 'wf-version-1',
      workflowId: 'workflow-1',
      trigger: { type: 'MANUAL' },
      __typename: 'WorkflowVersion' as const,
    };

    mockFindOneWorkflowVersion.mockImplementation(
      async ({ onCompleted }: { onCompleted: (data: unknown) => void }) => {
        onCompleted(workflowVersionRecord);
      },
    );

    const expectedPayloads = [{ recordId: 'rec-1' }];
    mockBuildTriggerWorkflowVersionPayloads.mockReturnValue(expectedPayloads);

    const { result } = renderHook(
      () =>
        useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(),
      { wrapper },
    );

    const headlessEngineCommandContextApi = buildBaseContextApi();

    let enrichedResult: unknown;

    await act(async () => {
      enrichedResult =
        await result.current.enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(
          {
            headlessEngineCommandContextApi,
            workflowVersionId: 'wf-version-1',
            availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
          },
        );
    });

    expect(enrichedResult).toEqual({
      ...headlessEngineCommandContextApi,
      workflowId: 'workflow-1',
      workflowVersionId: 'wf-version-1',
      payloads: expectedPayloads,
    });
  });

  it('should return undefined when workflow version is not found', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    mockFindOneWorkflowVersion.mockImplementation(async () => {});

    const { result } = renderHook(
      () =>
        useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(),
      { wrapper },
    );

    let enrichedResult: unknown;

    await act(async () => {
      enrichedResult =
        await result.current.enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(
          {
            headlessEngineCommandContextApi: buildBaseContextApi(),
            workflowVersionId: 'nonexistent',
            availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
          },
        );
    });

    expect(enrichedResult).toBeUndefined();
  });

  it('should return undefined for RECORD_SELECTION type when payloads are empty', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const workflowVersionRecord = {
      id: 'wf-version-1',
      workflowId: 'workflow-1',
      trigger: { type: 'MANUAL' },
      __typename: 'WorkflowVersion' as const,
    };

    mockFindOneWorkflowVersion.mockImplementation(
      async ({ onCompleted }: { onCompleted: (data: unknown) => void }) => {
        onCompleted(workflowVersionRecord);
      },
    );

    mockBuildTriggerWorkflowVersionPayloads.mockReturnValue([]);

    const { result } = renderHook(
      () =>
        useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(),
      { wrapper },
    );

    let enrichedResult: unknown;

    await act(async () => {
      enrichedResult =
        await result.current.enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(
          {
            headlessEngineCommandContextApi: buildBaseContextApi(),
            workflowVersionId: 'wf-version-1',
            availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
          },
        );
    });

    expect(enrichedResult).toBeUndefined();
  });

  it('should show warning snackbar when selected records exceed QUERY_MAX_RECORDS', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const workflowVersionRecord = {
      id: 'wf-version-1',
      workflowId: 'workflow-1',
      trigger: { type: 'MANUAL' },
      __typename: 'WorkflowVersion' as const,
    };

    mockFindOneWorkflowVersion.mockImplementation(
      async ({ onCompleted }: { onCompleted: (data: unknown) => void }) => {
        onCompleted(workflowVersionRecord);
      },
    );

    mockBuildTriggerWorkflowVersionPayloads.mockReturnValue([
      { recordId: 'rec-1' },
    ]);

    const selectedRecordIds = Array.from({ length: 201 }, (_, index) =>
      String(index),
    );

    const headlessEngineCommandContextApi = buildBaseContextApi({
      targetedRecordsRule: { mode: 'selection', selectedRecordIds },
    });

    const { result } = renderHook(
      () =>
        useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(),
      { wrapper },
    );

    await act(async () => {
      await result.current.enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(
        {
          headlessEngineCommandContextApi,
          workflowVersionId: 'wf-version-1',
          availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
        },
      );
    });

    expect(mockEnqueueWarningSnackBar).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          dedupeKey: 'workflow-manual-trigger-selection-limit',
        },
      }),
    );
  });
});
