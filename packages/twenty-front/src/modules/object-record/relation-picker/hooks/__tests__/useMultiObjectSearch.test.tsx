import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  MultiObjectSearch,
  ObjectRecordForSelect,
  SelectedObjectRecordId,
  useMultiObjectSearch,
} from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useMultiObjectSearchMatchesSearchFilterAndSelectedItemsQuery } from '@/object-record/relation-picker/hooks/useMultiObjectSearchMatchesSearchFilterAndSelectedItemsQuery';
import { useMultiObjectSearchMatchesSearchFilterAndToSelectQuery } from '@/object-record/relation-picker/hooks/useMultiObjectSearchMatchesSearchFilterAndToSelectQuery';
import { useMultiObjectSearchSelectedItemsQuery } from '@/object-record/relation-picker/hooks/useMultiObjectSearchSelectedItemsQuery';
import { renderHook } from '@testing-library/react';
import { FieldMetadataType } from '~/generated/graphql';

jest.mock(
  '@/object-record/relation-picker/hooks/useMultiObjectSearchSelectedItemsQuery',
);
jest.mock(
  '@/object-record/relation-picker/hooks/useMultiObjectSearchMatchesSearchFilterAndSelectedItemsQuery',
);
jest.mock(
  '@/object-record/relation-picker/hooks/useMultiObjectSearchMatchesSearchFilterAndToSelectQuery',
);

const objectData: ObjectMetadataItem[] = [
  {
    createdAt: 'createdAt',
    id: 'id',
    isActive: true,
    isCustom: true,
    isSystem: false,
    isRemote: false,
    labelPlural: 'labelPlural',
    labelSingular: 'labelSingular',
    namePlural: 'namePlural',
    nameSingular: 'nameSingular',
    updatedAt: 'updatedAt',
    fields: [
      {
        id: 'f6a0a73a-5ee6-442e-b764-39b682471240',
        name: 'id',
        label: 'id',
        type: FieldMetadataType.Uuid,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
      },
    ],
    indexMetadatas: [],
  },
];

describe('useMultiObjectSearch', () => {
  const selectedObjectRecordIds: SelectedObjectRecordId[] = [
    { objectNameSingular: 'object1', id: '1' },
    { objectNameSingular: 'object2', id: '2' },
  ];
  const searchFilterValue = 'searchValue';
  const limit = 5;
  const excludedObjectRecordIds: SelectedObjectRecordId[] = [
    { objectNameSingular: 'object3', id: '3' },
    { objectNameSingular: 'object4', id: '4' },
  ];
  const excludedObjects: CoreObjectNameSingular[] = [];

  const selectedObjectRecords: ObjectRecordForSelect[] = [
    {
      objectMetadataItem: objectData[0],
      record: {
        __typename: 'ObjectRecord',
        id: '1',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
      recordIdentifier: {
        id: '1',
        name: 'name',
      },
    },
  ];
  const selectedObjectRecordsLoading = false;

  const selectedAndMatchesSearchFilterObjectRecords: ObjectRecordForSelect[] =
    [];
  const selectedAndMatchesSearchFilterObjectRecordsLoading = false;

  const toSelectAndMatchesSearchFilterObjectRecords: ObjectRecordForSelect[] =
    [];
  const toSelectAndMatchesSearchFilterObjectRecordsLoading = false;

  beforeEach(() => {
    (useMultiObjectSearchSelectedItemsQuery as jest.Mock).mockReturnValue({
      selectedObjectRecords,
      selectedObjectRecordsLoading,
    });

    (
      useMultiObjectSearchMatchesSearchFilterAndSelectedItemsQuery as jest.Mock
    ).mockReturnValue({
      selectedAndMatchesSearchFilterObjectRecords,
      selectedAndMatchesSearchFilterObjectRecordsLoading,
    });

    (
      useMultiObjectSearchMatchesSearchFilterAndToSelectQuery as jest.Mock
    ).mockReturnValue({
      toSelectAndMatchesSearchFilterObjectRecords,
      toSelectAndMatchesSearchFilterObjectRecordsLoading,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return the correct object records and loading state', () => {
    const { result } = renderHook(() =>
      useMultiObjectSearch({
        searchFilterValue,
        selectedObjectRecordIds,
        limit,
        excludedObjectRecordIds,
        excludedObjects,
      }),
    );

    const expected: MultiObjectSearch = {
      selectedObjectRecords,
      filteredSelectedObjectRecords:
        selectedAndMatchesSearchFilterObjectRecords,
      objectRecordsToSelect: toSelectAndMatchesSearchFilterObjectRecords,
      loading:
        selectedAndMatchesSearchFilterObjectRecordsLoading ||
        toSelectAndMatchesSearchFilterObjectRecordsLoading ||
        selectedObjectRecordsLoading,
    };

    expect(result.current).toEqual(expected);
  });
});
