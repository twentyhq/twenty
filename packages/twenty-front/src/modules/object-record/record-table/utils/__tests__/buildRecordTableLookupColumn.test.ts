import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { buildRecordTableLookupColumn } from '@/object-record/record-table/utils/buildRecordTableLookupColumn';

const buildRecordField = (
  fieldMetadataItemId: string,
  position: number,
): Pick<RecordField, 'fieldMetadataItemId' | 'position'> => ({
  fieldMetadataItemId,
  position,
});

describe('buildRecordTableLookupColumn', () => {
  it('places the lookup column after the last column of its relation', () => {
    const lookupColumn = buildRecordTableLookupColumn({
      relationFieldMetadataItemId: 'company',
      relationTargetFieldMetadataId: 'industry',
      recordFields: [
        buildRecordField('name', 0),
        buildRecordField('company', 1),
        buildRecordField('company', 2),
        buildRecordField('city', 3),
      ],
    });

    expect(lookupColumn).toMatchObject({
      fieldMetadataItemId: 'company',
      relationTargetFieldMetadataId: 'industry',
      isCanonical: false,
      isVisible: true,
    });
    expect(lookupColumn.position).toBeGreaterThan(2);
    expect(lookupColumn.position).toBeLessThan(3);
  });

  it('places the lookup column last when its relation has no column', () => {
    expect(
      buildRecordTableLookupColumn({
        relationFieldMetadataItemId: 'company',
        relationTargetFieldMetadataId: 'industry',
        recordFields: [
          buildRecordField('name', 0),
          buildRecordField('city', 3),
        ],
      }).position,
    ).toBeGreaterThan(3);
  });
});
