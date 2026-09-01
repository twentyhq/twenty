import { type ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useCreateJunctionRecordWithNestedTarget } from '@/object-record/record-field/ui/hooks/useCreateJunctionRecordWithNestedTarget';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems');
jest.mock('@/object-record/hooks/useBuildRecordInputFromRLSPredicates');
jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: jest.fn(),
}));
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar');

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
const junctionConfig = resolveJunctionConfig({
  settings: taskTargetsField.settings,
  relationObjectMetadataId: fieldDefinition.metadata.relationObjectMetadataId,
  relationTargetFieldMetadataId:
    fieldDefinition.metadata.relationFieldMetadataId,
  sourceObjectMetadataId: rocketMetadata.id,
  objectMetadataItems,
});

if (!isUsableJunctionConfig(junctionConfig)) {
  throw new Error('Expected a usable test junction');
}

const mockCreateOneRecord = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();

const createWrapper = (store: ReturnType<typeof createStore>) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <JotaiProvider store={store}>{children}</JotaiProvider>;
  };

describe('useCreateJunctionRecordWithNestedTarget', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useObjectMetadataItems).mockReturnValue({
      objectMetadataItems,
    });
    jest.mocked(useBuildRecordInputFromRLSPredicates).mockReturnValue({
      buildRecordInputFromRLSPredicates: () => ({}),
    });
    jest.mocked(useCreateOneRecord).mockReturnValue({
      createOneRecord: mockCreateOneRecord,
      loading: false,
    } as ReturnType<typeof useCreateOneRecord>);
    jest.mocked(useSnackBar).mockReturnValue({
      enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
    } as unknown as ReturnType<typeof useSnackBar>);
  });

  it('adds the persisted junction to the source record store', async () => {
    const store = createStore();
    const sourceRecordId = 'rocket-id';

    store.set(recordStoreFamilyState.atomFamily(sourceRecordId), {
      id: sourceRecordId,
      __typename: 'Rocket',
      taskTargets: [],
    });
    mockCreateOneRecord.mockImplementation(async (input) => {
      const targetRecord = (input.task as { create: Record<string, unknown> })
        .create;

      return {
        id: 'task-target-id',
        __typename: 'TaskTarget',
        task: {
          ...targetRecord,
          __typename: 'Task',
        },
      };
    });

    const { result } = renderHook(
      () =>
        useCreateJunctionRecordWithNestedTarget({
          sourceRecordId,
          sourceFieldName: 'taskTargets',
          sourceObjectMetadataItem: rocketMetadata,
          junctionConfig,
        }),
      { wrapper: createWrapper(store) },
    );

    let createdMorphItem: RecordPickerPickableMorphItem | undefined;

    await act(async () => {
      createdMorphItem =
        await result.current.createJunctionRecordWithNestedTarget({
          searchInput: 'Prepare launch',
          targetObjectMetadataItemId: taskMetadata.id,
        });
    });

    const sourceRecord = store.get(
      recordStoreFamilyState.atomFamily(sourceRecordId),
    );

    expect(sourceRecord?.taskTargets).toEqual([
      expect.objectContaining({
        id: 'task-target-id',
        task: expect.objectContaining({
          id: createdMorphItem?.recordId,
          title: 'Prepare launch',
        }),
      }),
    ]);
    expect(createdMorphItem).toEqual({
      recordId: expect.any(String),
      objectMetadataId: taskMetadata.id,
      isSelected: true,
      isMatchingSearchFilter: true,
    });
  });
});
