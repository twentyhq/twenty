import { renderHook } from '@testing-library/react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useRecordIndexTableLazyQuery } from '@/object-record/record-index/hooks/useRecordIndexTableLazyQuery';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-record/hooks/useLazyFindManyRecords');
jest.mock('@/object-record/record-field/hooks/useRelevantRecordsGqlFields');
jest.mock(
  '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams',
);

const mockUseObjectMetadataItem = jest.mocked(useObjectMetadataItem);
const mockUseLazyFindManyRecords = jest.mocked(useLazyFindManyRecords);
const mockUseRelevantRecordsGqlFields = jest.mocked(
  useRelevantRecordsGqlFields,
);
const mockUseFindManyRecordIndexTableParams = jest.mocked(
  useFindManyRecordIndexTableParams,
);

describe('useRecordIndexTableLazyQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: { nameSingular: 'person' },
    } as any);
    mockUseFindManyRecordIndexTableParams.mockReturnValue({
      objectNameSingular: 'person',
    } as any);
    mockUseRelevantRecordsGqlFields.mockReturnValue({ id: true });
    mockUseLazyFindManyRecords.mockReturnValue({
      findManyRecordsLazy: jest.fn(),
      fetchMoreRecordsLazy: jest.fn(),
      queryIdentifier: 'people',
    } as any);
  });

  // Records created while the table was unmounted never reach the Apollo cache,
  // so a cache-first initial load would show a stale list until a full reload
  it('loads the table from the network rather than the cache', () => {
    renderHook(() => useRecordIndexTableLazyQuery('person'));

    expect(mockUseLazyFindManyRecords).toHaveBeenCalledTimes(1);
    expect(mockUseLazyFindManyRecords).toHaveBeenCalledWith({
      objectNameSingular: 'person',
      recordGqlFields: { id: true },
      fetchPolicy: 'network-only',
    });
  });
});
