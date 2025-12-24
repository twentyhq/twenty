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

  describe('select field on bar chart', () => {
    it('should include all options for select field', () => {
      const result = filterSortOptionsByFieldType({
        options: allOptions,
        isSelectField: true,
        chartType: 'bar',
      });

      expect(result).toHaveLength(7);
    });

    it('should exclude value sorts for date field', () => {
      const result = filterSortOptionsByFieldType({
        options: allOptions,
        isSelectField: true,
        isDateField: true,
        chartType: 'bar',
      });

      expect(result).not.toContainEqual({ value: GraphOrderBy.VALUE_ASC });
      expect(result).not.toContainEqual({ value: GraphOrderBy.VALUE_DESC });
      expect(result).toHaveLength(5);
    });
  });

  describe('non-select field on bar chart', () => {
    it('should exclude manual and position sorts', () => {
      const result = filterSortOptionsByFieldType({
        options: allOptions,
        isSelectField: false,
        chartType: 'bar',
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

    it('should exclude value sorts for date field', () => {
      const result = filterSortOptionsByFieldType({
        options: allOptions,
        isSelectField: false,
        isDateField: true,
        chartType: 'bar',
      });

      expect(result).not.toContainEqual({ value: GraphOrderBy.VALUE_ASC });
      expect(result).not.toContainEqual({ value: GraphOrderBy.VALUE_DESC });
      expect(result).toHaveLength(2);
    });
  });

  describe('line chart', () => {
    it('should always exclude value sorts', () => {
      const result = filterSortOptionsByFieldType({
        options: allOptions,
        isSelectField: true,
        chartType: 'line',
      });

      expect(result).not.toContainEqual({ value: GraphOrderBy.VALUE_ASC });
      expect(result).not.toContainEqual({ value: GraphOrderBy.VALUE_DESC });
      expect(result).toHaveLength(5);
    });

    it('should exclude manual and position sorts for non-select field', () => {
      const result = filterSortOptionsByFieldType({
        options: allOptions,
        isSelectField: false,
        chartType: 'line',
      });

      expect(result).not.toContainEqual({ value: GraphOrderBy.MANUAL });
      expect(result).not.toContainEqual({
        value: GraphOrderBy.FIELD_POSITION_ASC,
      });
      expect(result).not.toContainEqual({
        value: GraphOrderBy.FIELD_POSITION_DESC,
      });
      expect(result).not.toContainEqual({ value: GraphOrderBy.VALUE_ASC });
      expect(result).not.toContainEqual({ value: GraphOrderBy.VALUE_DESC });
      expect(result).toHaveLength(2);
    });
  });

  describe('pie chart', () => {
    it('should include all options for select field', () => {
      const result = filterSortOptionsByFieldType({
        options: allOptions,
        isSelectField: true,
        chartType: 'pie',
      });

      expect(result).toHaveLength(7);
    });

    it('should exclude manual and position sorts for non-select field', () => {
      const result = filterSortOptionsByFieldType({
        options: allOptions,
        isSelectField: false,
        chartType: 'pie',
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

    it('should exclude value sorts for date field', () => {
      const result = filterSortOptionsByFieldType({
        options: allOptions,
        isSelectField: false,
        isDateField: true,
        chartType: 'pie',
      });

      expect(result).not.toContainEqual({ value: GraphOrderBy.VALUE_ASC });
      expect(result).not.toContainEqual({ value: GraphOrderBy.VALUE_DESC });
      expect(result).toHaveLength(2);
    });
  });
});
