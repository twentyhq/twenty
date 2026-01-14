import { FieldMetadataType } from 'twenty-shared/types';

import { filterSortOptionsByFieldType } from '@/command-menu/pages/page-layout/utils/filterSortOptionsByFieldType';
import { GraphOrderBy } from '~/generated/graphql';

describe('filterSortOptionsByFieldType', () => {
  const allOptions = [
    { value: GraphOrderBy.FIELD_POSITION_ASC },
    { value: GraphOrderBy.FIELD_POSITION_DESC },
    { value: GraphOrderBy.FIELD_ASC },
    { value: GraphOrderBy.FIELD_DESC },
    { value: GraphOrderBy.VALUE_ASC },
    { value: GraphOrderBy.VALUE_DESC },
    { value: GraphOrderBy.MANUAL },
  ];

  describe('select field', () => {
    it('should include all options for select field', () => {
      const result = filterSortOptionsByFieldType({
        options: allOptions,
        fieldType: FieldMetadataType.SELECT,
      });

      expect(result).toHaveLength(7);
    });
  });

  describe('date field', () => {
    it('should exclude value sorts for date select field', () => {
      const result = filterSortOptionsByFieldType({
        options: allOptions,
        fieldType: FieldMetadataType.DATE,
      });

      expect(result).not.toContainEqual({ value: GraphOrderBy.VALUE_ASC });
      expect(result).not.toContainEqual({ value: GraphOrderBy.VALUE_DESC });
      expect(result).not.toContainEqual({ value: GraphOrderBy.MANUAL });
      expect(result).not.toContainEqual({
        value: GraphOrderBy.FIELD_POSITION_ASC,
      });
      expect(result).not.toContainEqual({
        value: GraphOrderBy.FIELD_POSITION_DESC,
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('non-select, non-date field', () => {
    it('should exclude manual and position sorts', () => {
      const result = filterSortOptionsByFieldType({
        options: allOptions,
        fieldType: FieldMetadataType.TEXT,
      });

      expect(result).not.toContainEqual({ value: GraphOrderBy.MANUAL });
      expect(result).not.toContainEqual({
        value: GraphOrderBy.FIELD_POSITION_ASC,
      });
      expect(result).not.toContainEqual({
        value: GraphOrderBy.FIELD_POSITION_DESC,
      });
      expect(result).toHaveLength(4);
    });
  });
});
