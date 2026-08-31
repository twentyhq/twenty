import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useUpdateJunctionRelationFromCell } from '@/object-record/record-field/ui/hooks/useUpdateJunctionRelationFromCell';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockCreateJunctionRecords = jest.fn();
const mockDeleteJunctionRecord = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItems');

jest.mock('@/object-record/hooks/useCreateManyRecords', () => ({
  useCreateManyRecords: () => ({
    createManyRecords: mockCreateJunctionRecords,
  }),
}));

jest.mock('@/object-record/hooks/useDeleteOneRecord', () => ({
  useDeleteOneRecord: () => ({
    deleteOneRecord: mockDeleteJunctionRecord,
  }),
}));

const sourceRecordId = 'source-record-id';
const targetRecordId = 'target-record-id';

describe('useUpdateJunctionRelationFromCell', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
  const taskObjectMetadata = getMockObjectMetadataItemOrThrow('task');
  const taskTargetObjectMetadata =
    getMockObjectMetadataItemOrThrow('taskTarget');
  const personObjectMetadata = getMockObjectMetadataItemOrThrow('person');
  const taskTargetsFieldMetadata = getMockFieldMetadataItemOrThrow({
    objectMetadataItem: taskObjectMetadata,
    fieldName: 'taskTargets',
  });

  const fieldDefinition = {
    fieldMetadataId: taskTargetsFieldMetadata.id,
    label: taskTargetsFieldMetadata.label,
    iconName: taskTargetsFieldMetadata.icon,
    type: taskTargetsFieldMetadata.type,
    metadata: {
      fieldName: taskTargetsFieldMetadata.name,
      objectMetadataNameSingular: taskObjectMetadata.nameSingular,
      relationFieldMetadataId:
        taskTargetsFieldMetadata.relation?.targetFieldMetadata.id ?? '',
      relationObjectMetadataId: taskTargetObjectMetadata.id,
      relationObjectMetadataNamePlural: taskTargetObjectMetadata.namePlural,
      relationObjectMetadataNameSingular: taskTargetObjectMetadata.nameSingular,
      relationType: taskTargetsFieldMetadata.relation?.type,
      settings: taskTargetsFieldMetadata.settings,
    },
  } as FieldDefinition<FieldRelationMetadata>;
  const selectedMorphItem = {
    recordId: targetRecordId,
    objectMetadataId: personObjectMetadata.id,
    isSelected: true,
    isMatchingSearchFilter: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteJunctionRecord.mockResolvedValue(undefined);
    jest.mocked(useObjectMetadataItems).mockReturnValue({
      objectMetadataItems,
    });
  });

  const setup = ({
    includeTargetSearchRecord = true,
    metadataItems = objectMetadataItems,
  }: {
    includeTargetSearchRecord?: boolean;
    metadataItems?: EnrichedObjectMetadataItem[];
  } = {}) => {
    jest.mocked(useObjectMetadataItems).mockReturnValue({
      objectMetadataItems: metadataItems,
    });

    const store = createStore();
    store.set(recordStoreFamilyState.atomFamily(sourceRecordId), {
      id: sourceRecordId,
      __typename: 'Task',
      taskTargets: [],
    });

    if (includeTargetSearchRecord) {
      store.set(searchRecordStoreFamilyState.atomFamily(targetRecordId), {
        label: 'Target person',
        objectLabelSingular: personObjectMetadata.labelSingular,
        objectNameSingular: personObjectMetadata.nameSingular,
        recordId: targetRecordId,
        tsRank: 1,
        tsRankCD: 1,
        record: {
          id: targetRecordId,
          __typename: 'Person',
        },
      });
    }

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    );
    const renderedHook = renderHook(
      () =>
        useUpdateJunctionRelationFromCell({
          fieldMetadataItem: taskTargetsFieldMetadata,
          fieldDefinition,
          recordId: sourceRecordId,
        }),
      { wrapper: Wrapper },
    );

    return { ...renderedHook, store };
  };

  it('rejects an empty create response and removes the optimistic junction', async () => {
    let resolveCreate: (records: []) => void = () => {};
    const createPromise = new Promise<[]>((resolve) => {
      resolveCreate = resolve;
    });
    mockCreateJunctionRecords.mockReturnValue(createPromise);

    const { result, store } = setup();

    let updatePromise: Promise<void> = Promise.resolve();
    act(() => {
      updatePromise = result.current.updateJunctionRelationFromCell({
        morphItem: selectedMorphItem,
      });
    });

    expect(
      store.get(recordStoreFamilyState.atomFamily(sourceRecordId))?.taskTargets,
    ).toHaveLength(1);

    await act(async () => {
      resolveCreate([]);
      await expect(updatePromise).rejects.toThrow(
        'Failed to create junction record',
      );
    });

    expect(mockCreateJunctionRecords).toHaveBeenCalledWith({
      recordsToCreate: [
        {
          taskId: sourceRecordId,
          targetPersonId: targetRecordId,
        },
      ],
      upsert: true,
    });
    expect(
      store.get(recordStoreFamilyState.atomFamily(sourceRecordId))?.taskTargets,
    ).toEqual([]);
  });

  it('rejects selection when junction configuration is unavailable', async () => {
    const { result } = setup({
      metadataItems: objectMetadataItems.filter(
        ({ id }) => id !== taskTargetObjectMetadata.id,
      ),
    });

    await expect(
      result.current.updateJunctionRelationFromCell({
        morphItem: selectedMorphItem,
      }),
    ).rejects.toThrow('valid junction configuration');
    expect(mockCreateJunctionRecords).not.toHaveBeenCalled();
  });

  it('rejects selection when source metadata is unavailable', async () => {
    const { result } = setup({
      metadataItems: objectMetadataItems.filter(
        ({ id }) => id !== taskObjectMetadata.id,
      ),
    });

    await expect(
      result.current.updateJunctionRelationFromCell({
        morphItem: selectedMorphItem,
      }),
    ).rejects.toThrow('source object metadata');
    expect(mockCreateJunctionRecords).not.toHaveBeenCalled();
  });

  it('rejects selection of an unsupported target object', async () => {
    const { result } = setup();

    await expect(
      result.current.updateJunctionRelationFromCell({
        morphItem: {
          ...selectedMorphItem,
          objectMetadataId: taskObjectMetadata.id,
        },
      }),
    ).rejects.toThrow('unsupported target object');
    expect(mockCreateJunctionRecords).not.toHaveBeenCalled();
  });

  it('rejects selection when the target search record is unavailable', async () => {
    const { result } = setup({ includeTargetSearchRecord: false });

    await expect(
      result.current.updateJunctionRelationFromCell({
        morphItem: selectedMorphItem,
      }),
    ).rejects.toThrow('target record is unavailable');
    expect(mockCreateJunctionRecords).not.toHaveBeenCalled();
  });

  it('treats deselecting a missing junction as an idempotent success', async () => {
    const { result } = setup();

    await expect(
      result.current.updateJunctionRelationFromCell({
        morphItem: {
          ...selectedMorphItem,
          isSelected: false,
        },
      }),
    ).resolves.toBeUndefined();
    expect(mockDeleteJunctionRecord).not.toHaveBeenCalled();
  });

  it('deletes the persisted junction ID after a create completes', async () => {
    const persistedJunctionId = 'persisted-junction-id';
    let resolveCreate: (
      records: { id: string; __typename: string }[],
    ) => void = () => {};
    const createPromise = new Promise<{ id: string; __typename: string }[]>(
      (resolve) => {
        resolveCreate = resolve;
      },
    );
    mockCreateJunctionRecords.mockReturnValue(createPromise);
    const { result, store } = setup();

    let updatePromise: Promise<void> = Promise.resolve();
    act(() => {
      updatePromise = result.current.updateJunctionRelationFromCell({
        morphItem: selectedMorphItem,
      });
    });

    expect(
      store.get(recordStoreFamilyState.atomFamily(sourceRecordId))
        ?.taskTargets[0].id,
    ).not.toBe(persistedJunctionId);

    await act(async () => {
      resolveCreate([
        {
          id: persistedJunctionId,
          __typename: 'TaskTarget',
        },
      ]);
      await updatePromise;
    });

    expect(
      store.get(recordStoreFamilyState.atomFamily(sourceRecordId))
        ?.taskTargets[0].id,
    ).toBe(persistedJunctionId);

    await act(async () => {
      await result.current.updateJunctionRelationFromCell({
        morphItem: {
          ...selectedMorphItem,
          isSelected: false,
        },
      });
    });

    expect(mockDeleteJunctionRecord).toHaveBeenCalledWith(persistedJunctionId);
  });
});
