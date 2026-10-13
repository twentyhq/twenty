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

const mockCoreQuery = jest.fn();

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
    mockCoreQuery.mockReset();
  });

  it('should return undefined when the core workflow version is not found', async () => {
    mockCoreQuery.mockResolvedValue({ data: { coreWorkflowVersion: null } });

    const { result } = renderHook(
      () =>
        useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(),
      { wrapper: getWrapper() },
    );

    let enrichedResult: unknown;

    await act(async () => {
      enrichedResult =
        await result.current.enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(
          {
            headlessEngineCommandContextApi: buildBaseContextApi(),
            coreWorkflowVersionId: 'nonexistent',
            availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
          },
        );
    });

    expect(enrichedResult).toBeUndefined();
  });

  it('uses the core pointer', async () => {
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
  });

  it('resolves legacy command items before reading the core definition', async () => {
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
  });

  it('propagates a failing core query', async () => {
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
  });
});
