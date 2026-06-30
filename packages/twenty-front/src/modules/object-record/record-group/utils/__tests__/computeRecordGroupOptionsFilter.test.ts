import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeRecordGroupOptionsFilter } from '@/object-record/record-group/utils/computeRecordGroupOptionsFilter';

const mockFieldMetadata = {
  id: 'field-1',
  name: 'status',
} as FieldMetadataItem;

describe('computeRecordGroupOptionsFilter', () => {
  it('should return empty object when recordGroupFieldMetadata is undefined', () => {
    const result = computeRecordGroupOptionsFilter({
      recordGroupFieldMetadata: undefined,
      recordGroupValues: ['value1', 'value2'],
    });

    expect(result).toEqual({});
  });

  it('should return empty object when recordGroupFieldMetadata is null', () => {
    const result = computeRecordGroupOptionsFilter({
      recordGroupFieldMetadata: null,
      recordGroupValues: ['value1', 'value2'],
    });

    expect(result).toEqual({});
  });

  it('should return simple IN filter when no null values present', () => {
    const result = computeRecordGroupOptionsFilter({
      recordGroupFieldMetadata: mockFieldMetadata,
      recordGroupValues: ['value1', 'value2', 'value3'],
    });

    expect(result).toEqual({
      status: {
        in: ['value1', 'value2', 'value3'],
      },
    });
  });

  it('should return OR filter with IS NULL when null value is present', () => {
    const result = computeRecordGroupOptionsFilter({
      recordGroupFieldMetadata: mockFieldMetadata,
      recordGroupValues: ['value1', null, 'value2'],
    });

    expect(result).toEqual({
      or: [
        { status: { is: 'NULL' } },
        { status: { in: ['value1', 'value2'] } },
      ],
    });
  });
});
