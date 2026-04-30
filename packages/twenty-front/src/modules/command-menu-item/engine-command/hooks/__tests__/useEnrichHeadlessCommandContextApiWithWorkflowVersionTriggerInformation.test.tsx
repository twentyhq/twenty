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

jest.mock('@/object-record/hooks/useLazyFindOneRecord', () => ({
  useLazyFindOneRecord: () => ({
    findOneRecord: mockFindOneWorkflowVersion,
  }),
}));

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
  payload: null,
  ...overrides,
});

describe('useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return enriched context with workflow metadata', async () => {
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
            availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
            availabilityObjectMetadataId: 'obj-1',
          },
        );
    });

    expect(enrichedResult).toEqual({
      ...headlessEngineCommandContextApi,
      workflowId: 'workflow-1',
      workflowVersionId: 'wf-version-1',
      trigger: { type: 'MANUAL' },
      availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      availabilityObjectMetadataId: 'obj-1',
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
});
