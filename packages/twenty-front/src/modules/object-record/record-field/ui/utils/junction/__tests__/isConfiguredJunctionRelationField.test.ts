import { isConfiguredJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isConfiguredJunctionRelationField';
import { FieldMetadataType } from 'twenty-shared/types';

describe('isConfiguredJunctionRelationField', () => {
  it.each([
    {
      field: { type: FieldMetadataType.TEXT, settings: null },
      expected: false,
    },
    {
      field: { type: FieldMetadataType.RELATION, settings: null },
      expected: false,
    },
    {
      field: {
        type: FieldMetadataType.RELATION,
        settings: { junctionTargetFieldId: 'field-id' },
      },
      expected: true,
    },
    {
      field: {
        type: FieldMetadataType.MORPH_RELATION,
        settings: { junctionTargetFieldId: 'field-id' },
      },
      expected: false,
    },
  ])('returns $expected for $field.type', ({ field, expected }) => {
    expect(isConfiguredJunctionRelationField(field)).toBe(expected);
  });
});
