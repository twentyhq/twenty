import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { renderHook } from '@testing-library/react';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockObjectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const mockRocketMetadata = getMockObjectMetadataItemOrThrow('rocket');
const mockRocketTaskTargetsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: mockRocketMetadata,
  fieldName: 'taskTargets',
});

const mockVisibleRecordFields = [
  { fieldMetadataItemId: mockRocketTaskTargetsField.id },
];
const mockFieldMetadataItemByFieldMetadataItemId: Record<
  string,
  FieldMetadataItem
> = {
  [mockRocketTaskTargetsField.id]: mockRocketTaskTargetsField,
};

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: mockObjectMetadataItems,
  }),
}));

jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => ({
    fieldMetadataItemByFieldMetadataItemId:
      mockFieldMetadataItemByFieldMetadataItemId,
  }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({
    useAtomComponentSelectorValue: () => mockVisibleRecordFields,
  }),
);

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => [],
  }),
);

describe('useRelevantRecordsGqlFields', () => {
  it('keeps reverse junction terminal fields when the junction field is visible', () => {
    const { result } = renderHook(() =>
      useRelevantRecordsGqlFields({
        objectMetadataItem: mockRocketMetadata,
      }),
    );

    expect(result.current).toMatchObject({
      taskTargets: {
        id: true,
        task: { id: true },
      },
    });
  });
});
