import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
import { hasJunctionTargetFieldId } from '@/object-record/record-field/ui/utils/junction/hasJunctionTargetFieldId';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { FieldMetadataType } from 'twenty-shared/types';

describe('isJunctionRelation', () => {
  describe('hasJunctionTargetFieldId', () => {
    it.each([
      { settings: undefined, expected: false, desc: 'undefined' },
      { settings: null, expected: false, desc: 'null' },
      { settings: {}, expected: false, desc: 'empty object' },
      {
        settings: { junctionTargetFieldId: '' },
        expected: false,
        desc: 'empty string',
      },
      {
        settings: { junctionTargetFieldId: 'field-id' },
        expected: true,
        desc: 'valid value',
      },
    ])('returns $expected for $desc', ({ settings, expected }) => {
      expect(hasJunctionTargetFieldId(settings)).toBe(expected);
    });

    it('narrows type correctly', () => {
      const settings = { junctionTargetFieldId: 'field-id-1' };
      if (hasJunctionTargetFieldId(settings)) {
        expect(settings.junctionTargetFieldId).toBe('field-id-1');
      }
    });
  });

  describe('hasJunctionConfig', () => {
    it.each([
      { settings: undefined, expected: false, desc: 'undefined' },
      { settings: {}, expected: false, desc: 'empty object' },
      {
        settings: { junctionTargetFieldId: 'field-id' },
        expected: true,
        desc: 'fieldId set',
      },
      {
        settings: { junctionTargetFieldId: '' },
        expected: false,
        desc: 'empty fieldId',
      },
    ])('returns $expected for $desc', ({ settings, expected }) => {
      expect(hasJunctionConfig(settings)).toBe(expected);
    });
  });

  describe('isJunctionRelationField', () => {
    it.each([
      {
        field: { type: FieldMetadataType.TEXT, settings: null },
        expected: false,
        desc: 'non-relation field',
      },
      {
        field: { type: FieldMetadataType.RELATION, settings: null },
        expected: false,
        desc: 'relation without junction config',
      },
      {
        field: {
          type: FieldMetadataType.RELATION,
          settings: { junctionTargetFieldId: 'field-id' },
        },
        expected: true,
        desc: 'relation with junction config',
      },
      {
        field: {
          type: FieldMetadataType.MORPH_RELATION,
          settings: { junctionTargetFieldId: 'field-id' },
        },
        expected: false,
        desc: 'morph relation (not supported)',
      },
    ])('returns $expected for $desc', ({ field, expected }) => {
      expect(isJunctionRelationField(field)).toBe(expected);
    });
  });
});
