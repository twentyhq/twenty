import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getOrderByForFieldMetadataType } from '@/object-metadata/utils/getOrderByForFieldMetadataType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const buildField = (
  overrides: Pick<FieldMetadataItem, 'type' | 'name'> &
    Partial<Pick<FieldMetadataItem, 'id' | 'settings'>>,
): Pick<FieldMetadataItem, 'id' | 'name' | 'type' | 'settings'> => ({
  id: 'field-id',
  ...overrides,
});

describe('getOrderByForFieldMetadataType', () => {
  describe('FULL_NAME', () => {
    it('sorts by firstName then lastName when no setting is configured', () => {
      const field = buildField({
        type: FieldMetadataType.FULL_NAME,
        name: 'name',
      });

      expect(getOrderByForFieldMetadataType(field, 'AscNullsLast')).toEqual([
        {
          name: {
            firstName: 'AscNullsLast',
            lastName: 'AscNullsLast',
          },
        },
      ]);
    });

    it('uses the configured sub-field as the primary sort key', () => {
      const field = buildField({
        type: FieldMetadataType.FULL_NAME,
        name: 'name',
        settings: { defaultSortSubField: 'lastName' },
      });

      const result = getOrderByForFieldMetadataType(field, 'DescNullsLast');
      const keys = Object.keys(result[0].name as Record<string, unknown>);

      expect(keys[0]).toBe('lastName');
      expect(keys[1]).toBe('firstName');
      expect((result[0].name as Record<string, string>).lastName).toBe(
        'DescNullsLast',
      );
    });
  });

  describe('ADDRESS', () => {
    it('falls back to addressCity when no sub-field is configured', () => {
      const field = buildField({
        type: FieldMetadataType.ADDRESS,
        name: 'address',
      });

      expect(getOrderByForFieldMetadataType(field, 'AscNullsLast')).toEqual([
        {
          address: {
            addressCity: 'AscNullsLast',
          },
        },
      ]);
    });

    it('uses the configured sub-field', () => {
      const field = buildField({
        type: FieldMetadataType.ADDRESS,
        name: 'address',
        settings: {
          subFields: ['addressStreet1', 'addressCountry'],
          defaultSortSubField: 'addressCountry',
        },
      });

      expect(getOrderByForFieldMetadataType(field, 'DescNullsLast')).toEqual([
        {
          address: {
            addressCountry: 'DescNullsLast',
          },
        },
      ]);
    });
  });
});
