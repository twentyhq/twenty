import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';

import { type GroupByDateField } from 'src/engine/api/common/common-query-runners/types/group-by-field.types';
import { getGroupByExpression } from 'src/engine/api/common/common-query-runners/utils/get-group-by-expression.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const buildDateTimeFieldMetadata = (): FlatFieldMetadata => {
  return {
    type: FieldMetadataType.DATE_TIME,
    name: 'createdAt',
  } as FlatFieldMetadata;
};

const buildGroupByDateField = (
  overrides: Partial<GroupByDateField> = {},
): GroupByDateField => ({
  fieldMetadata: buildDateTimeFieldMetadata(),
  dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
  timeZone: 'America/New_York',
  ...overrides,
});

describe('getGroupByExpression', () => {
  const columnNameWithQuotes = '"company"."createdAt"';

  describe('timezone validation', () => {
    it('should accept valid IANA timezones', () => {
      const groupByField = buildGroupByDateField({
        timeZone: 'America/New_York',
      });

      const result = getGroupByExpression({
        groupByField,
        columnNameWithQuotes,
      });

      expect(result).toContain("'America/New_York'");
    });

    it('should accept UTC timezone', () => {
      const groupByField = buildGroupByDateField({ timeZone: 'UTC' });

      const result = getGroupByExpression({
        groupByField,
        columnNameWithQuotes,
      });

      expect(result).toContain("'UTC'");
    });

    it('should reject SQL injection in timezone field', () => {
      const groupByField = buildGroupByDateField({
        timeZone: "UTC'; DROP TABLE users; --",
      });

      expect(() =>
        getGroupByExpression({ groupByField, columnNameWithQuotes }),
      ).toThrow();
    });

    it('should reject UNION-based injection in timezone', () => {
      const groupByField = buildGroupByDateField({
        timeZone: "UTC') UNION SELECT * FROM pg_shadow --",
      });

      expect(() =>
        getGroupByExpression({ groupByField, columnNameWithQuotes }),
      ).toThrow();
    });

    it('should reject arbitrary strings as timezone', () => {
      const groupByField = buildGroupByDateField({
        timeZone: 'not_a_real_timezone',
      });

      expect(() =>
        getGroupByExpression({ groupByField, columnNameWithQuotes }),
      ).toThrow();
    });
  });

  describe('missing timezone handling', () => {
    it('should throw when timezone is required but not provided', () => {
      const groupByField = buildGroupByDateField({
        timeZone: undefined,
      });

      expect(() =>
        getGroupByExpression({ groupByField, columnNameWithQuotes }),
      ).toThrow(
        'Time zone should be specified for a group by date on Day, Week, Month, Quarter or Year',
      );
    });
  });

  describe('granularity without timezone', () => {
    it('should return column directly for NONE granularity', () => {
      const groupByField = buildGroupByDateField({
        dateGranularity: ObjectRecordGroupByDateGranularity.NONE,
        timeZone: undefined,
      });

      const result = getGroupByExpression({
        groupByField,
        columnNameWithQuotes,
      });

      expect(result).toBe(columnNameWithQuotes);
    });

    it('should handle DAY_OF_THE_WEEK without timezone', () => {
      const groupByField = buildGroupByDateField({
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
        timeZone: undefined,
      });

      const result = getGroupByExpression({
        groupByField,
        columnNameWithQuotes,
      });

      expect(result).toContain('TMDay');
      expect(result).not.toContain('AT TIME ZONE');
    });
  });
});
