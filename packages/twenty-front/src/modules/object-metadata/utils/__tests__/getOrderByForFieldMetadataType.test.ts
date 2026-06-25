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
    it('sorts by firstName then lastName when no per-sort sub-field is given', () => {
      const field = buildField({
        type: FieldMetadataType.FULL_NAME,
        name: 'name',
      });

      expect(
        getOrderByForFieldMetadataType({
          field,
          orderByDirection: 'AscNullsLast',
        }),
      ).toEqual([
        { name: { firstName: 'AscNullsLast' } },
        { name: { lastName: 'AscNullsLast' } },
      ]);
    });

    it('uses the per-sort primaryCompositeSubField as the primary sort key', () => {
      const field = buildField({
        type: FieldMetadataType.FULL_NAME,
        name: 'name',
      });

      expect(
        getOrderByForFieldMetadataType({
          field,
          orderByDirection: 'DescNullsLast',
          primaryCompositeSubField: 'lastName',
        }),
      ).toEqual([
        { name: { lastName: 'DescNullsLast' } },
        { name: { firstName: 'DescNullsLast' } },
      ]);
    });
  });

  describe('ADDRESS', () => {
    it('falls back to addressCity when no per-sort sub-field is given', () => {
      const field = buildField({
        type: FieldMetadataType.ADDRESS,
        name: 'address',
      });

      expect(
        getOrderByForFieldMetadataType({
          field,
          orderByDirection: 'AscNullsLast',
        }),
      ).toEqual([
        {
          address: {
            addressCity: 'AscNullsLast',
          },
        },
      ]);
    });

    it('uses the per-sort primaryCompositeSubField when provided', () => {
      const field = buildField({
        type: FieldMetadataType.ADDRESS,
        name: 'address',
      });

      expect(
        getOrderByForFieldMetadataType({
          field,
          orderByDirection: 'DescNullsLast',
          primaryCompositeSubField: 'addressCountry',
        }),
      ).toEqual([
        {
          address: {
            addressCountry: 'DescNullsLast',
          },
        },
      ]);
    });
  });
});
