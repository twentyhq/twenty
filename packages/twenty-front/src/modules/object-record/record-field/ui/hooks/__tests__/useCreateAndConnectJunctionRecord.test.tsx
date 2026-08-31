import { act, renderHook } from '@testing-library/react';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useCreateAndConnectJunctionRecord } from '@/object-record/record-field/ui/hooks/useCreateAndConnectJunctionRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { logError } from '~/utils/logError';

jest.mock('uuid', () => ({ v4: jest.fn() }));
jest.mock(
  '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect',
  () => ({ triggerCreateRecordsOptimisticEffect: jest.fn() }),
);
jest.mock(
  '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent',
  () => ({ dispatchObjectRecordOperationBrowserEvent: jest.fn() }),
);
jest.mock('@/object-metadata/hooks/useApolloCoreClient');
jest.mock('@/object-metadata/hooks/useObjectMetadataItems');
jest.mock('@/object-record/cache/hooks/useCreateOneRecordInCache');
jest.mock('@/object-record/cache/utils/getRecordNodeFromRecord');
jest.mock('@/object-record/hooks/useObjectPermissions');
jest.mock('@/object-record/hooks/useRefetchAggregateQueries');
jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore');
jest.mock('@/object-record/utils/buildRecordLabelPayload');
jest.mock('@/object-record/utils/computeOptimisticRecordFromInput');
jest.mock('@/object-record/utils/sanitizeRecordInput');
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar');
jest.mock('~/utils/logError');

const TARGET_RECORD_INPUT_ID = 'target-record-input-id';
const TARGET_RECORD_ID = 'target-record-id';
const JUNCTION_RECORD_ID = 'junction-record-id';
const SOURCE_RECORD_ID = 'source-record-id';
const RELATION_FIELD_METADATA_ID = 'relation-field-metadata-id';

const targetObjectMetadataItem = {
  id: 'target-object-id',
  nameSingular: 'task',
  namePlural: 'tasks',
  fields: [],
} as unknown as EnrichedObjectMetadataItem;

const junctionObjectMetadataItem = {
  id: 'junction-object-id',
  nameSingular: 'taskTarget',
  namePlural: 'taskTargets',
  fields: [],
} as unknown as EnrichedObjectMetadataItem;

const mockMutate = jest.fn();
const mockCreateTargetRecordInCache = jest.fn((record) => record);
const mockCreateJunctionRecordInCache = jest.fn((record) => record);
const mockRefetchAggregateQueries = jest.fn().mockResolvedValue(undefined);
const mockEnqueueErrorSnackBar = jest.fn();
const mockUpsertRecordsInStore = jest.fn();
const sourceRecordFromCache = {
  id: SOURCE_RECORD_ID,
  __typename: 'Person',
};
const targetRecordFromCache = {
  id: TARGET_RECORD_ID,
  __typename: 'Task',
};

const successfulMutationData = {
  createAndConnectJunctionRecord: {
    targetRecord: { id: TARGET_RECORD_ID, title: 'Follow up' },
    junctionRecord: {
      id: JUNCTION_RECORD_ID,
      taskId: TARGET_RECORD_ID,
      targetId: SOURCE_RECORD_ID,
    },
  },
};

describe('useCreateAndConnectJunctionRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (v4 as jest.Mock).mockReturnValue(TARGET_RECORD_INPUT_ID);
    (useApolloCoreClient as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      cache: {},
    });
    (useObjectMetadataItems as jest.Mock).mockReturnValue({
      objectMetadataItems: [
        targetObjectMetadataItem,
        junctionObjectMetadataItem,
      ],
    });
    (useObjectPermissions as jest.Mock).mockReturnValue({
      objectPermissionsByObjectMetadataId: {},
    });
    (useUpsertRecordsInStore as jest.Mock).mockReturnValue({
      upsertRecordsInStore: mockUpsertRecordsInStore,
    });
    (useRefetchAggregateQueries as jest.Mock).mockReturnValue({
      refetchAggregateQueries: mockRefetchAggregateQueries,
    });
    (useSnackBar as jest.Mock).mockReturnValue({
      enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
    });
    (useCreateOneRecordInCache as jest.Mock).mockImplementation(
      ({ objectMetadataItem }) =>
        objectMetadataItem.id === targetObjectMetadataItem.id
          ? mockCreateTargetRecordInCache
          : mockCreateJunctionRecordInCache,
    );
    (buildRecordLabelPayload as jest.Mock).mockReturnValue({
      id: TARGET_RECORD_INPUT_ID,
      title: 'Follow up',
    });
    (sanitizeRecordInput as jest.Mock).mockImplementation(
      ({ recordInput }) => recordInput,
    );
    (computeOptimisticRecordFromInput as jest.Mock).mockReturnValue({
      id: 'non-authoritative-junction-id',
      taskId: 'non-authoritative-target-id',
      targetId: 'non-authoritative-source-id',
      task: targetRecordFromCache,
      targetPerson: sourceRecordFromCache,
    });
    (getRecordNodeFromRecord as jest.Mock).mockImplementation(
      ({ record }) => record,
    );
  });

  const renderCreateHook = () =>
    renderHook(() =>
      useCreateAndConnectJunctionRecord({
        sourceRecordId: SOURCE_RECORD_ID,
        relationFieldMetadataId: RELATION_FIELD_METADATA_ID,
        targetObjectMetadataItem,
        junctionObjectMetadataItem,
      }),
    );

  it('uses one mutation and synchronously ignores a duplicate create', async () => {
    let resolveMutation: (value: {
      data: typeof successfulMutationData;
    }) => void = () => undefined;

    mockMutate.mockReturnValue(
      new Promise((resolve) => {
        resolveMutation = resolve;
      }),
    );

    const { result } = renderCreateHook();
    let firstCreatePromise: Promise<string | undefined>;
    let duplicateCreatePromise: Promise<string | undefined>;

    act(() => {
      firstCreatePromise =
        result.current.createAndConnectJunctionRecord('Follow up');
      duplicateCreatePromise =
        result.current.createAndConnectJunctionRecord('Follow up');
    });

    expect(result.current.loading).toBe(true);
    await expect(duplicateCreatePromise!).resolves.toBeUndefined();
    expect(mockMutate).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveMutation({ data: successfulMutationData });
      await expect(firstCreatePromise!).resolves.toBe(TARGET_RECORD_ID);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: expect.anything(),
      variables: {
        input: {
          sourceRecordId: SOURCE_RECORD_ID,
          relationFieldMetadataId: RELATION_FIELD_METADATA_ID,
          targetRecordInput: {
            id: TARGET_RECORD_INPUT_ID,
            title: 'Follow up',
          },
        },
      },
    });
    expect(v4).toHaveBeenCalledTimes(1);
    expect(mockCreateTargetRecordInCache).toHaveBeenCalledTimes(1);
    expect(mockCreateTargetRecordInCache).toHaveBeenCalledWith(
      expect.objectContaining({ id: TARGET_RECORD_ID }),
    );
    expect(mockCreateJunctionRecordInCache).toHaveBeenCalledTimes(1);
    expect(mockCreateJunctionRecordInCache).toHaveBeenCalledWith(
      expect.objectContaining({ id: JUNCTION_RECORD_ID }),
    );
    expect(triggerCreateRecordsOptimisticEffect).toHaveBeenCalledTimes(2);
    expect(triggerCreateRecordsOptimisticEffect).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        objectMetadataItem: targetObjectMetadataItem,
        recordsToCreate: [expect.objectContaining({ id: TARGET_RECORD_ID })],
      }),
    );
    expect(triggerCreateRecordsOptimisticEffect).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        objectMetadataItem: junctionObjectMetadataItem,
        recordsToCreate: [expect.objectContaining({ id: JUNCTION_RECORD_ID })],
      }),
    );
    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(2);
    expect(dispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledTimes(2);
    expect(result.current.loading).toBe(false);
  });

  it('keeps the picker unchanged and surfaces a mutation error', async () => {
    const mutationError = new Error('Mutation failed');

    mockMutate.mockRejectedValue(mutationError);
    const { result } = renderCreateHook();

    await act(async () => {
      await expect(
        result.current.createAndConnectJunctionRecord('Follow up'),
      ).resolves.toBeUndefined();
    });

    expect(mockCreateTargetRecordInCache).not.toHaveBeenCalled();
    expect(mockCreateJunctionRecordInCache).not.toHaveBeenCalled();
    expect(triggerCreateRecordsOptimisticEffect).not.toHaveBeenCalled();
    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      apolloError: mutationError,
    });
    expect(dispatchObjectRecordOperationBrowserEvent).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('resolves both junction relations before applying inverse updates', async () => {
    mockMutate.mockResolvedValue({ data: successfulMutationData });
    const { result } = renderCreateHook();

    await act(async () => {
      await result.current.createAndConnectJunctionRecord('Follow up');
    });

    expect(
      mockCreateTargetRecordInCache.mock.invocationCallOrder[0],
    ).toBeLessThan(
      (computeOptimisticRecordFromInput as jest.Mock).mock
        .invocationCallOrder[0],
    );
    expect(computeOptimisticRecordFromInput).toHaveBeenCalledWith(
      expect.objectContaining({
        objectMetadataItem: junctionObjectMetadataItem,
        recordInput:
          successfulMutationData.createAndConnectJunctionRecord.junctionRecord,
      }),
    );
    expect(mockCreateJunctionRecordInCache).toHaveBeenCalledWith(
      expect.objectContaining({
        id: JUNCTION_RECORD_ID,
        taskId: TARGET_RECORD_ID,
        targetId: SOURCE_RECORD_ID,
        task: targetRecordFromCache,
        targetPerson: sourceRecordFromCache,
      }),
    );
    expect(triggerCreateRecordsOptimisticEffect).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        objectMetadataItem: junctionObjectMetadataItem,
        recordsToCreate: [
          expect.objectContaining({
            task: targetRecordFromCache,
            targetPerson: sourceRecordFromCache,
          }),
        ],
      }),
    );
  });

  it('still reports success when best-effort local cache or refetch work fails', async () => {
    const cacheError = new Error('Cache failed');
    const relationResolutionError = new Error('Relation resolution failed');
    const refetchError = new Error('Refetch failed');

    mockMutate.mockResolvedValue({ data: successfulMutationData });
    mockCreateTargetRecordInCache.mockImplementationOnce(() => {
      throw cacheError;
    });
    (computeOptimisticRecordFromInput as jest.Mock).mockImplementationOnce(
      () => {
        throw relationResolutionError;
      },
    );
    mockRefetchAggregateQueries
      .mockRejectedValueOnce(refetchError)
      .mockResolvedValueOnce(undefined);

    const { result } = renderCreateHook();

    await act(async () => {
      await expect(
        result.current.createAndConnectJunctionRecord('Follow up'),
      ).resolves.toBe(TARGET_RECORD_ID);
    });

    expect(mockCreateTargetRecordInCache).toHaveBeenCalledTimes(1);
    expect(mockCreateJunctionRecordInCache).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(cacheError);
    expect(logError).toHaveBeenCalledWith(relationResolutionError);
    expect(logError).toHaveBeenCalledWith(refetchError);
    expect(mockEnqueueErrorSnackBar).not.toHaveBeenCalled();
    expect(dispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledTimes(2);
    expect(result.current.loading).toBe(false);
  });
});
