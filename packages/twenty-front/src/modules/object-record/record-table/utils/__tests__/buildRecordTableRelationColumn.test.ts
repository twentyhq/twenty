import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { buildRecordTableRelationColumn } from '@/object-record/record-table/utils/buildRecordTableRelationColumn';

const buildRecordField = (
  fieldMetadataItemId: string,
  position: number,
): Pick<RecordField, 'fieldMetadataItemId' | 'position'> => ({
  fieldMetadataItemId,
  position,
});

describe('buildRecordTableRelationColumn', () => {
  it('places the column after the last column of its relation', () => {
    const relationColumn = buildRecordTableRelationColumn({
      relationFieldMetadataItemId: 'company',
      relationTargetFieldMetadataId: 'industry',
      recordFields: [
        buildRecordField('name', 0),
        buildRecordField('company', 1),
        buildRecordField('company', 2),
        buildRecordField('city', 3),
      ],
    });

    expect(relationColumn).toMatchObject({
      fieldMetadataItemId: 'company',
      relationTargetFieldMetadataId: 'industry',
      relationAggregateOperation: null,
      isCanonical: false,
      isVisible: true,
    });
    expect(relationColumn.position).toBeGreaterThan(2);
    expect(relationColumn.position).toBeLessThan(3);
  });

  it('places the column last when its relation has no column', () => {
    expect(
      buildRecordTableRelationColumn({
        relationFieldMetadataItemId: 'company',
        relationTargetFieldMetadataId: 'industry',
        recordFields: [
          buildRecordField('name', 0),
          buildRecordField('city', 3),
        ],
      }).position,
    ).toBeGreaterThan(3);
  });

  it('builds an aggregate column without a target field for a count', () => {
    expect(
      buildRecordTableRelationColumn({
        relationFieldMetadataItemId: 'people',
        relationAggregateOperation: AggregateOperations.COUNT,
        recordFields: [buildRecordField('name', 0)],
      }),
    ).toMatchObject({
      fieldMetadataItemId: 'people',
      relationTargetFieldMetadataId: null,
      relationAggregateOperation: AggregateOperations.COUNT,
      isCanonical: false,
    });
  });
});
