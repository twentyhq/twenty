import { type ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateJunctionRelationFromCell } from '@/object-record/record-field/ui/hooks/useUpdateJunctionRelationFromCell';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems');
jest.mock('@/object-record/hooks/useCreateManyRecords', () => ({
  useCreateManyRecords: jest.fn(),
}));
jest.mock('@/object-record/hooks/useDeleteOneRecord', () => ({
  useDeleteOneRecord: jest.fn(),
}));

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const rocketMetadata = getMockObjectMetadataItemOrThrow('rocket');
const taskMetadata = getMockObjectMetadataItemOrThrow('task');
const taskTargetsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: rocketMetadata,
  fieldName: 'taskTargets',
});
const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
  field: taskTargetsField,
  objectMetadataItem: rocketMetadata,
}) as FieldDefinition<FieldRelationMetadata>;

const mockCreateManyRecords = jest.fn();
const mockDeleteOneRecord = jest.fn();

const createWrapper = (store: ReturnType<typeof createStore>) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <JotaiProvider store={store}>{children}</JotaiProvider>;
  };

describe('useUpdateJunctionRelationFromCell', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useObjectMetadataItems).mockReturnValue({
      objectMetadataItems,
    });
    jest.mocked(useCreateManyRecords).mockReturnValue({
      createManyRecords: mockCreateManyRecords,
    } as ReturnType<typeof useCreateManyRecords>);
    jest.mocked(useDeleteOneRecord).mockReturnValue({
      deleteOneRecord: mockDeleteOneRecord,
    } as ReturnType<typeof useDeleteOneRecord>);
  });

  it('creates a pivot from the source record to the selected terminal record', async () => {
    const store = createStore();
    const sourceRecordId = 'rocket-id';
    const targetRecordId = 'task-id';

    store.set(recordStoreFamilyState.atomFamily(sourceRecordId), {
      id: sourceRecordId,
      __typename: 'Rocket',
      taskTargets: [],
    });
    mockCreateManyRecords.mockResolvedValue([
      {
        id: 'persisted-task-target-id',
        __typename: 'TaskTarget',
      },
    ]);

    const { result } = renderHook(
      () =>
        useUpdateJunctionRelationFromCell({
          fieldMetadataItem: taskTargetsField,
          fieldDefinition,
          recordId: sourceRecordId,
        }),
      { wrapper: createWrapper(store) },
    );

    expect(result.current.junctionConfig).toMatchObject({
      direction: 'reverse',
      targetFields: [{ name: 'task' }],
    });

    await act(async () => {
      await result.current.updateJunctionRelationFromCell({
        morphItem: {
          recordId: targetRecordId,
          objectMetadataId: taskMetadata.id,
          isSelected: true,
          isMatchingSearchFilter: true,
        },
      });
    });

    expect(mockCreateManyRecords).toHaveBeenCalledWith({
      recordsToCreate: [
        {
          targetRocketId: sourceRecordId,
          taskId: targetRecordId,
        },
      ],
      upsert: true,
    });
  });

  it('deletes the pivot instead of detaching or updating it', async () => {
    const store = createStore();
    const sourceRecordId = 'rocket-id';
    const targetRecordId = 'task-id';

    store.set(recordStoreFamilyState.atomFamily(sourceRecordId), {
      id: sourceRecordId,
      __typename: 'Rocket',
      taskTargets: [
        {
          id: 'task-target-id',
          __typename: 'TaskTarget',
          task: {
            id: targetRecordId,
            __typename: 'Task',
          },
        },
      ],
    });
    mockDeleteOneRecord.mockResolvedValue({
      id: 'task-target-id',
      __typename: 'TaskTarget',
    });

    const { result } = renderHook(
      () =>
        useUpdateJunctionRelationFromCell({
          fieldMetadataItem: taskTargetsField,
          fieldDefinition,
          recordId: sourceRecordId,
        }),
      { wrapper: createWrapper(store) },
    );

    await act(async () => {
      await result.current.updateJunctionRelationFromCell({
        morphItem: {
          recordId: targetRecordId,
          objectMetadataId: taskMetadata.id,
          isSelected: false,
          isMatchingSearchFilter: true,
        },
      });
    });

    expect(mockDeleteOneRecord).toHaveBeenCalledWith('task-target-id');
    expect(mockCreateManyRecords).not.toHaveBeenCalled();
  });
});
