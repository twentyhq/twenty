import { upsertSavedScopedRecordField } from '@/object-record/record-column-scope/utils/upsertSavedScopedRecordField';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type ViewFieldRelationScope } from 'twenty-shared/types';

const RELATION_SCOPE: ViewFieldRelationScope = {
  filters: [],
  filterGroups: [],
  sorts: [],
  limit: 2,
};

const buildRecordField = (recordField: Partial<RecordField>): RecordField => ({
  id: 'people-column',
  fieldMetadataItemId: 'people-field',
  position: 1,
  isVisible: true,
  size: 100,
  ...recordField,
});

describe('upsertSavedScopedRecordField', () => {
  it('appends a column that is not in the table yet', () => {
    const nameColumn = buildRecordField({ id: 'name-column' });
    const savedRecordField = buildRecordField({
      relationScope: RELATION_SCOPE,
    });

    expect(
      upsertSavedScopedRecordField({
        recordFields: [nameColumn],
        savedRecordField,
      }),
    ).toEqual([nameColumn, savedRecordField]);
  });

  it('only patches the scope of an existing column, keeping a newer size', () => {
    expect(
      upsertSavedScopedRecordField({
        recordFields: [buildRecordField({ size: 240 })],
        savedRecordField: buildRecordField({ relationScope: RELATION_SCOPE }),
      }),
    ).toEqual([buildRecordField({ size: 240, relationScope: RELATION_SCOPE })]);
  });
});
