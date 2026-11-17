import { findCanonicalRecordField } from '@/object-record/record-field/utils/findCanonicalRecordField';

describe('findCanonicalRecordField', () => {
  it("returns the field's own column, not an extra column of it", () => {
    const extraColumn = {
      id: 'extra',
      fieldMetadataItemId: 'tasks',
      isCanonical: false,
    };
    const ownColumn = { id: 'own', fieldMetadataItemId: 'tasks' };

    expect(
      findCanonicalRecordField({
        recordFields: [extraColumn, ownColumn],
        fieldMetadataItemId: 'tasks',
      }),
    ).toBe(ownColumn);
  });

  it('returns undefined when the field only has extra columns', () => {
    expect(
      findCanonicalRecordField({
        recordFields: [{ fieldMetadataItemId: 'tasks', isCanonical: false }],
        fieldMetadataItemId: 'tasks',
      }),
    ).toBeUndefined();
  });
});
