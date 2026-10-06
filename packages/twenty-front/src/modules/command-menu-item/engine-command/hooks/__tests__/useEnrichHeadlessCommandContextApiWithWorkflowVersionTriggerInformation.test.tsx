import {
  GetCoreWorkflowVersionDocument,
  GetCoreWorkflowVersionLegacyMappingDocument,
} from '~/generated/graphql';
import { type HeadlessEngineCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation } from '@/command-menu-item/engine-command/hooks/useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation';
import { renderHook } from '@testing-library/react';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

const mockCoreQuery = jest.fn();

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ query: mockCoreQuery }),
}));

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

const renderEnrichHook = () =>
  renderHook(() =>
    useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(),
  ).result.current
    .enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation;

describe('useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation', () => {
  beforeEach(() => {
    mockCoreQuery.mockReset();
  });

  it('reads the core version and its trigger', async () => {
    mockCoreQuery.mockResolvedValue({
      data: {
        coreWorkflowVersion: {
          id: 'core-version',
          coreWorkflowId: 'core-workflow',
          trigger: { type: 'MANUAL' },
        },
      },
    });
    const headlessEngineCommandContextApi = buildBaseContextApi();

    const context = await renderEnrichHook()({
      headlessEngineCommandContextApi,
      coreWorkflowVersionId: 'core-version',
      availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      availabilityObjectMetadataId: 'obj-1',
    });

    expect(mockCoreQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        query: GetCoreWorkflowVersionDocument,
        variables: { coreWorkflowVersionId: 'core-version' },
      }),
    );
    expect(context).toEqual({
      ...headlessEngineCommandContextApi,
      workflowId: 'core-workflow',
      workflowVersionId: 'core-version',
      coreWorkflowId: 'core-workflow',
      coreWorkflowVersionId: 'core-version',
      trigger: { type: 'MANUAL' },
      availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      availabilityObjectMetadataId: 'obj-1',
    });
  });

  it('resolves legacy command items through the core alias', async () => {
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

    const context = await renderEnrichHook()({
      headlessEngineCommandContextApi: buildBaseContextApi(),
      workflowVersionId: 'workspace-version',
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    });

    expect(mockCoreQuery).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        query: GetCoreWorkflowVersionLegacyMappingDocument,
        variables: { workspaceWorkflowVersionId: 'workspace-version' },
      }),
    );
    expect(context).toMatchObject({
      coreWorkflowVersionId: 'core-version',
      workflowId: 'core-workflow',
    });
  });

  it('returns undefined when the legacy alias has no core version', async () => {
    mockCoreQuery.mockResolvedValueOnce({
      data: { coreWorkflowVersion: null },
    });

    const context = await renderEnrichHook()({
      headlessEngineCommandContextApi: buildBaseContextApi(),
      workflowVersionId: 'unknown-version',
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    });

    expect(context).toBeUndefined();
    expect(mockCoreQuery).toHaveBeenCalledTimes(1);
  });

  it('propagates core query failures', async () => {
    mockCoreQuery.mockRejectedValue(new Error('core unavailable'));

    await expect(
      renderEnrichHook()({
        headlessEngineCommandContextApi: buildBaseContextApi(),
        coreWorkflowVersionId: 'core-version',
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      }),
    ).rejects.toThrow('core unavailable');
  });
});
