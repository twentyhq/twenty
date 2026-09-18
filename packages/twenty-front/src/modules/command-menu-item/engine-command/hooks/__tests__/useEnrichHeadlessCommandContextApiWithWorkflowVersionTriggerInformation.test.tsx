import {
  GetCoreWorkflowVersionDocument,
  GetCoreWorkflowVersionLegacyMappingDocument,
} from '~/generated/graphql';
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
const mockCoreQuery = jest.fn();
let mockIsCore = false;
jest.mock('@/workflow/hooks/useIsWorkflowCoreEnabled', () => ({
  useIsWorkflowCoreEnabled: () => mockIsCore,
}));

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
  navigationTargetObjectMetadataId: null,
  ...overrides,
});

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ query: mockCoreQuery }),
}));

describe('useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsCore = false;
    mockCoreQuery.mockReset().mockResolvedValue({
      data: { workflowVersionContent: { trigger: { type: 'MANUAL' } } },
    });
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
  it('uses the core pointer without loading workspace definitions', async () => {
    mockIsCore = true;
    mockCoreQuery.mockResolvedValue({
      data: {
        coreWorkflowVersion: {
          id: 'core-version',
          coreWorkflowId: 'core-workflow',
          trigger: { type: 'MANUAL' },
        },
      },
    });
    const { result } = renderHook(
      () =>
        useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(),
      { wrapper: getWrapper() },
    );
    const context =
      await result.current.enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(
        {
          headlessEngineCommandContextApi: buildBaseContextApi(),
          workflowVersionId: 'workspace-version',
          coreWorkflowVersionId: 'core-version',
          availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        },
      );
    expect(mockCoreQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        query: GetCoreWorkflowVersionDocument,
        variables: { coreWorkflowVersionId: 'core-version' },
      }),
    );
    expect(context).toMatchObject({
      coreWorkflowVersionId: 'core-version',
      workflowVersionId: 'core-version',
      workflowId: 'core-workflow',
    });
    expect(mockFindOneWorkflowVersion).not.toHaveBeenCalled();
  });

  it('resolves legacy command items before reading the core definition', async () => {
    mockIsCore = true;
    mockCoreQuery
      .mockResolvedValueOnce({
        data: { coreWorkflowVersion: { id: 'core-version' } },
      })
      .mockResolvedValueOnce({
        data: {
          coreWorkflowVersion: {
            id: 'core-version',
            coreWorkflowId: 'core-workflow',
          },
        },
      });
    const { result } = renderHook(
      () =>
        useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(),
      { wrapper: getWrapper() },
    );
    const context =
      await result.current.enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(
        {
          headlessEngineCommandContextApi: buildBaseContextApi(),
          workflowVersionId: 'workspace-version',
          availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        },
      );
    expect(mockCoreQuery).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        query: GetCoreWorkflowVersionLegacyMappingDocument,
        variables: { workspaceWorkflowVersionId: 'workspace-version' },
      }),
    );
    expect(context).toMatchObject({ coreWorkflowVersionId: 'core-version' });
    expect(mockFindOneWorkflowVersion).not.toHaveBeenCalled();
  });

  it('does not fall back to workspace definitions after a core query fails', async () => {
    mockIsCore = true;
    mockCoreQuery.mockRejectedValue(new Error('core unavailable'));
    const { result } = renderHook(
      () =>
        useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(),
      { wrapper: getWrapper() },
    );
    await expect(
      result.current.enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(
        {
          headlessEngineCommandContextApi: buildBaseContextApi(),
          coreWorkflowVersionId: 'core-version',
          workflowVersionId: 'workspace-version',
          availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        },
      ),
    ).rejects.toThrow('core unavailable');
    expect(mockFindOneWorkflowVersion).not.toHaveBeenCalled();
  });

  it('keeps workspace IDs when the flag is off even when a core pointer exists', async () => {
    mockFindOneWorkflowVersion.mockImplementation(
      async ({ onCompleted }: { onCompleted: (value: unknown) => void }) =>
        onCompleted({
          id: 'workspace-version',
          workflowId: 'workspace-workflow',
        }),
    );
    const { result } = renderHook(
      () =>
        useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(),
      { wrapper: getWrapper() },
    );
    const context =
      await result.current.enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(
        {
          headlessEngineCommandContextApi: buildBaseContextApi(),
          coreWorkflowVersionId: 'core-version',
          workflowVersionId: 'workspace-version',
          availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        },
      );
    expect(context).toMatchObject({
      workflowVersionId: 'workspace-version',
      workflowId: 'workspace-workflow',
    });
    expect(mockCoreQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { workflowVersionId: 'workspace-version' },
      }),
    );
  });
});
