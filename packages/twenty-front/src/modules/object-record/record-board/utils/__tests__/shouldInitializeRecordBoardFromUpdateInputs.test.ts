import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { shouldInitializeRecordBoardFromUpdateInputs } from '@/object-record/record-board/utils/shouldInitializeRecordBoardFromUpdateInputs';
import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { FieldMetadataType } from 'twenty-shared/types';

const activeFieldMetadataItems = [
  {
    id: 'stage-field-id',
    name: 'stage',
    type: FieldMetadataType.SELECT,
  },
  {
    id: 'amount-field-id',
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
  },
  {
    id: 'name-field-id',
    name: 'name',
    type: FieldMetadataType.TEXT,
  },
  {
    id: 'company-field-id',
    name: 'company',
    type: FieldMetadataType.RELATION,
  },
] as FieldMetadataItem[];

const currentRecordFilters = [
  {
    fieldMetadataId: 'amount-field-id',
  },
] as RecordFilter[];

const currentRecordSorts = [
  {
    fieldMetadataId: 'amount-field-id',
  },
] as RecordSort[];

const recordIndexGroupFieldMetadataItem = {
  id: 'stage-field-id',
};

const buildUpdateInput = (
  updatedFields: Record<string, unknown>[],
): ObjectRecordOperationUpdateInput => ({
  recordId: 'record-id',
  updatedFields,
});

describe('shouldInitializeRecordBoardFromUpdateInputs', () => {
  it('should return true for a grouped field update without position', () => {
    expect(
      shouldInitializeRecordBoardFromUpdateInputs({
        updateInputs: [buildUpdateInput([{ stage: 'SCREENING' }])],
        activeFieldMetadataItems,
        currentRecordFilters,
        currentRecordSorts,
        recordIndexGroupFieldMetadataItem,
      }),
    ).toBe(true);
  });

  it('should return false for a position-only update', () => {
    expect(
      shouldInitializeRecordBoardFromUpdateInputs({
        updateInputs: [buildUpdateInput([{ position: 1 }])],
        activeFieldMetadataItems,
        currentRecordFilters,
        currentRecordSorts,
        recordIndexGroupFieldMetadataItem,
      }),
    ).toBe(false);
  });

  it('should return true for a grouped field update mixed with position', () => {
    expect(
      shouldInitializeRecordBoardFromUpdateInputs({
        updateInputs: [
          buildUpdateInput([{ stage: 'SCREENING' }, { position: 1 }]),
        ],
        activeFieldMetadataItems,
        currentRecordFilters,
        currentRecordSorts,
        recordIndexGroupFieldMetadataItem,
      }),
    ).toBe(true);
  });

  it('should return true for a sorted field update mixed with position', () => {
    expect(
      shouldInitializeRecordBoardFromUpdateInputs({
        updateInputs: [
          buildUpdateInput([{ amount: { amountMicros: 1 } }, { position: 1 }]),
        ],
        activeFieldMetadataItems,
        currentRecordFilters: [],
        currentRecordSorts,
        recordIndexGroupFieldMetadataItem,
      }),
    ).toBe(true);
  });

  it('should return true for a filtered field update mixed with position', () => {
    expect(
      shouldInitializeRecordBoardFromUpdateInputs({
        updateInputs: [
          buildUpdateInput([{ amount: { amountMicros: 1 } }, { position: 1 }]),
        ],
        activeFieldMetadataItems,
        currentRecordFilters,
        currentRecordSorts: [],
        recordIndexGroupFieldMetadataItem,
      }),
    ).toBe(true);
  });

  it('should return false for an unrelated field update mixed with position', () => {
    expect(
      shouldInitializeRecordBoardFromUpdateInputs({
        updateInputs: [buildUpdateInput([{ name: 'Updated' }, { position: 1 }])],
        activeFieldMetadataItems,
        currentRecordFilters,
        currentRecordSorts,
        recordIndexGroupFieldMetadataItem,
      }),
    ).toBe(false);
  });
});
