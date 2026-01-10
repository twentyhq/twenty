import { FieldMetadataType } from 'twenty-shared/types';

import { parseCompositeFieldForOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/parse-composite-field-for-order.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

describe('parseCompositeFieldForOrder', () => {
  describe('case-insensitive sorting for composite subfields', () => {
    it('should wrap TEXT subfields with LOWER() for FULL_NAME composite', () => {
      const fieldMetadata = {
        type: FieldMetadataType.FULL_NAME,
        name: 'name',
      } as FlatFieldMetadata;

      const result = parseCompositeFieldForOrder(
        fieldMetadata,
        { firstName: 'AscNullsFirst' },
        'person',
        true,
      );

      expect(result).toEqual({
        'LOWER(person.nameFirstName)': { order: 'ASC', nulls: 'NULLS FIRST' },
      });
    });

    it('should wrap TEXT subfields with LOWER() for LINKS composite', () => {
      const fieldMetadata = {
        type: FieldMetadataType.LINKS,
        name: 'linkedinLink',
      } as FlatFieldMetadata;

      const result = parseCompositeFieldForOrder(
        fieldMetadata,
        { primaryLinkLabel: 'DescNullsLast' },
        'company',
        true,
      );

      expect(result).toEqual({
        'LOWER(company.linkedinLinkPrimaryLinkLabel)': {
          order: 'DESC',
          nulls: 'NULLS LAST',
        },
      });
    });

    it('should wrap TEXT subfields with LOWER() for ADDRESS composite', () => {
      const fieldMetadata = {
        type: FieldMetadataType.ADDRESS,
        name: 'address',
      } as FlatFieldMetadata;

      const result = parseCompositeFieldForOrder(
        fieldMetadata,
        { addressCity: 'AscNullsLast' },
        'company',
        true,
      );

      expect(result).toEqual({
        'LOWER(company.addressAddressCity)': {
          order: 'ASC',
          nulls: 'NULLS LAST',
        },
      });
    });
  });

  describe('case-sensitive sorting for non-text composite subfields', () => {
    it('should not wrap non-TEXT subfields with LOWER() for CURRENCY composite', () => {
      const fieldMetadata = {
        type: FieldMetadataType.CURRENCY,
        name: 'annualRevenue',
      } as FlatFieldMetadata;

      const result = parseCompositeFieldForOrder(
        fieldMetadata,
        { amountMicros: 'DescNullsFirst' },
        'company',
        true,
      );

      expect(result).toEqual({
        'company.annualRevenueAmountMicros': {
          order: 'DESC',
          nulls: 'NULLS FIRST',
        },
      });
    });

    it('should not wrap non-TEXT subfields with LOWER() for ADDRESS lat/lng', () => {
      const fieldMetadata = {
        type: FieldMetadataType.ADDRESS,
        name: 'address',
      } as FlatFieldMetadata;

      const result = parseCompositeFieldForOrder(
        fieldMetadata,
        { addressLat: 'AscNullsFirst' },
        'company',
        true,
      );

      expect(result).toEqual({
        'company.addressAddressLat': {
          order: 'ASC',
          nulls: 'NULLS FIRST',
        },
      });
    });
  });

  describe('pagination direction handling', () => {
    it('should reverse order direction for backward pagination', () => {
      const fieldMetadata = {
        type: FieldMetadataType.FULL_NAME,
        name: 'name',
      } as FlatFieldMetadata;

      const result = parseCompositeFieldForOrder(
        fieldMetadata,
        { firstName: 'AscNullsFirst' },
        'person',
        false,
      );

      expect(result).toEqual({
        'LOWER(person.nameFirstName)': { order: 'DESC', nulls: 'NULLS FIRST' },
      });
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid subfield name', () => {
      const fieldMetadata = {
        type: FieldMetadataType.FULL_NAME,
        name: 'name',
      } as FlatFieldMetadata;

      expect(() =>
        parseCompositeFieldForOrder(
          fieldMetadata,
          { invalidSubField: 'AscNullsFirst' },
          'person',
          true,
        ),
      ).toThrow('Sub field metadata not found');
    });

    it('should throw error for invalid order direction', () => {
      const fieldMetadata = {
        type: FieldMetadataType.FULL_NAME,
        name: 'name',
      } as FlatFieldMetadata;

      expect(() =>
        parseCompositeFieldForOrder(
          fieldMetadata,
          { firstName: 'InvalidDirection' },
          'person',
          true,
        ),
      ).toThrow('Sub field order by value must be of type OrderByDirection');
    });
  });
});
