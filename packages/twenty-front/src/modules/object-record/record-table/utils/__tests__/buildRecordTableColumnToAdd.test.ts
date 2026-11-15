import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { buildRecordTableColumnToAdd } from '@/object-record/record-table/utils/buildRecordTableColumnToAdd';

const buildRecordField = (id: string, position: number): RecordField => ({
  id,
  fieldMetadataItemId: `field-${id}`,
  position,
  isVisible: true,
  size: 150,
});

describe('buildRecordTableColumnToAdd', () => {
  it('should place an extra column of the same field right after its source', () => {
    const sourceRecordField = buildRecordField('tasks', 2);

    const recordTableColumnToAdd = buildRecordTableColumnToAdd({
      sourceRecordField,
      recordFields: [
        buildRecordField('name', 0),
        sourceRecordField,
        buildRecordField('notes', 3),
      ],
    });

    expect(recordTableColumnToAdd).toMatchObject({
      fieldMetadataItemId: 'field-tasks',
      isCanonical: false,
      isVisible: true,
      size: 150,
    });
    expect(recordTableColumnToAdd.position).toBeGreaterThan(2);
    expect(recordTableColumnToAdd.position).toBeLessThan(3);
  });

  it('should place it after the source when the source is last', () => {
    const sourceRecordField = buildRecordField('tasks', 2);

    expect(
      buildRecordTableColumnToAdd({
        sourceRecordField,
        recordFields: [sourceRecordField],
      }).position,
    ).toBeGreaterThan(2);
  });
});
