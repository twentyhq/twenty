import { FieldMetadataType } from 'twenty-shared/types';
import {
  IconSortAscending,
  IconSortAscendingLetters,
  IconSortAscendingNumbers,
  IconSortDescending,
  IconSortDescendingLetters,
  IconSortDescendingNumbers,
} from 'twenty-ui/display';

import { getSortIconForFieldType } from '@/command-menu/pages/page-layout/utils/getSortIconForFieldType';
import { GraphOrderBy } from '~/generated/graphql';

describe('getSortIconForFieldType', () => {
  describe('position sort', () => {
    it('should return IconSortAscending for FIELD_POSITION_ASC', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.SELECT,
          orderBy: GraphOrderBy.FIELD_POSITION_ASC,
        }),
      ).toBe(IconSortAscending);
    });

    it('should return IconSortDescending for FIELD_POSITION_DESC', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.SELECT,
          orderBy: GraphOrderBy.FIELD_POSITION_DESC,
        }),
      ).toBe(IconSortDescending);
    });
  });

  describe('text field types', () => {
    it('should return IconSortAscendingLetters for TEXT field ascending', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.TEXT,
          orderBy: GraphOrderBy.FIELD_ASC,
        }),
      ).toBe(IconSortAscendingLetters);
    });

    it('should return IconSortDescendingLetters for TEXT field descending', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.TEXT,
          orderBy: GraphOrderBy.FIELD_DESC,
        }),
      ).toBe(IconSortDescendingLetters);
    });

    it('should return IconSortAscendingLetters for RICH_TEXT field ascending', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.RICH_TEXT,
          orderBy: GraphOrderBy.FIELD_ASC,
        }),
      ).toBe(IconSortAscendingLetters);
    });

    it('should return IconSortAscendingLetters for RICH_TEXT_V2 field ascending', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.RICH_TEXT_V2,
          orderBy: GraphOrderBy.FIELD_ASC,
        }),
      ).toBe(IconSortAscendingLetters);
    });
  });

  describe('number field types', () => {
    it('should return IconSortAscendingNumbers for NUMBER field ascending', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.NUMBER,
          orderBy: GraphOrderBy.FIELD_ASC,
        }),
      ).toBe(IconSortAscendingNumbers);
    });

    it('should return IconSortDescendingNumbers for NUMBER field descending', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.NUMBER,
          orderBy: GraphOrderBy.FIELD_DESC,
        }),
      ).toBe(IconSortDescendingNumbers);
    });

    it('should return IconSortAscendingNumbers for CURRENCY field ascending', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.CURRENCY,
          orderBy: GraphOrderBy.FIELD_ASC,
        }),
      ).toBe(IconSortAscendingNumbers);
    });

    it('should return IconSortAscendingNumbers for RATING field ascending', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.RATING,
          orderBy: GraphOrderBy.FIELD_ASC,
        }),
      ).toBe(IconSortAscendingNumbers);
    });
  });

  describe('select field type', () => {
    it('should return IconSortAscendingLetters for SELECT field with FIELD_ASC', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.SELECT,
          orderBy: GraphOrderBy.FIELD_ASC,
        }),
      ).toBe(IconSortAscendingLetters);
    });

    it('should return IconSortDescendingLetters for SELECT field with FIELD_DESC', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.SELECT,
          orderBy: GraphOrderBy.FIELD_DESC,
        }),
      ).toBe(IconSortDescendingLetters);
    });
  });

  describe('undefined field type', () => {
    it('should return IconSortAscending for undefined field type ascending', () => {
      expect(
        getSortIconForFieldType({
          fieldType: undefined,
          orderBy: GraphOrderBy.FIELD_ASC,
        }),
      ).toBe(IconSortAscending);
    });

    it('should return IconSortDescending for undefined field type descending', () => {
      expect(
        getSortIconForFieldType({
          fieldType: undefined,
          orderBy: GraphOrderBy.FIELD_DESC,
        }),
      ).toBe(IconSortDescending);
    });
  });

  describe('value-based sort', () => {
    it('should return IconSortAscending for VALUE_ASC', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.NUMBER,
          orderBy: GraphOrderBy.VALUE_ASC,
        }),
      ).toBe(IconSortAscendingNumbers);
    });

    it('should return IconSortDescending for VALUE_DESC', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.NUMBER,
          orderBy: GraphOrderBy.VALUE_DESC,
        }),
      ).toBe(IconSortDescendingNumbers);
    });

    it('should return IconSortAscending for VALUE_ASC with undefined field type', () => {
      expect(
        getSortIconForFieldType({
          fieldType: undefined,
          orderBy: GraphOrderBy.VALUE_ASC,
        }),
      ).toBe(IconSortAscending);
    });

    it('should return IconSortDescending for VALUE_DESC with undefined field type', () => {
      expect(
        getSortIconForFieldType({
          fieldType: undefined,
          orderBy: GraphOrderBy.VALUE_DESC,
        }),
      ).toBe(IconSortDescending);
    });
  });

  describe('default cases', () => {
    it('should return IconSortAscending for DATE field ascending', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.DATE,
          orderBy: GraphOrderBy.FIELD_ASC,
        }),
      ).toBe(IconSortAscending);
    });

    it('should return IconSortDescending for DATE field descending', () => {
      expect(
        getSortIconForFieldType({
          fieldType: FieldMetadataType.DATE,
          orderBy: GraphOrderBy.FIELD_DESC,
        }),
      ).toBe(IconSortDescending);
    });
  });
});
