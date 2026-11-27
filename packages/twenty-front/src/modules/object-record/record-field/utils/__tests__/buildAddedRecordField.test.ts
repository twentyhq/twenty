import { buildAddedRecordField } from '@/object-record/record-field/utils/buildAddedRecordField';

describe('buildAddedRecordField', () => {
  it('builds a visible, non-canonical record field placed after the last one', () => {
    expect(
      buildAddedRecordField({
        currentRecordFields: [
          { position: 2 },
          { position: 7 },
          { position: 4 },
        ],
        fieldMetadataItemId: 'company-field',
        relationTargetFieldMetadataId: 'industry-field',
      }),
    ).toEqual({
      id: expect.any(String),
      fieldMetadataItemId: 'company-field',
      size: 100,
      isVisible: true,
      isCanonical: false,
      position: 8,
      relationTargetFieldMetadataId: 'industry-field',
    });
  });

  it('places the first record field at position 1', () => {
    expect(
      buildAddedRecordField({
        currentRecordFields: [],
        fieldMetadataItemId: 'people-field',
      }).position,
    ).toBe(1);
  });
});
