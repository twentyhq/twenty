import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';

describe('ProcessAggregateHelper', () => {
  describe('extractColumnNamesFromAggregateExpression', () => {
    it('should extract column names from CONCAT expression', () => {
      const selection =
        'CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(*) - COUNT(NULLIF(CONCAT("firstName","lastName")) END, \'\')';
      const result =
        ProcessAggregateHelper.extractColumnNamesFromAggregateExpression(
          selection,
        );

      expect(result).toEqual(['firstName', 'lastName']);
    });

    it('should extract column names from CONCAT expression - 2', () => {
      const selection =
        'CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(*) - COUNT(NULLIF(CONCAT("firstName")) END, \'\')';
      const result =
        ProcessAggregateHelper.extractColumnNamesFromAggregateExpression(
          selection,
        );

      expect(result).toEqual(['firstName']);
    });

    it('should extract column names from CONCAT expression - 3', () => {
      const selection =
        'CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(*) - COUNT(NULLIF(CONCAT("firstName","lastName","nickName")) END, \'\')';
      const result =
        ProcessAggregateHelper.extractColumnNamesFromAggregateExpression(
          selection,
        );

      expect(result).toEqual(['firstName', 'lastName', 'nickName']);
    });

    it('should extract column name from non-CONCAT expression', () => {
      const selection =
        'CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT("firstName") END';
      const result =
        ProcessAggregateHelper.extractColumnNamesFromAggregateExpression(
          selection,
        );

      expect(result).toEqual(['firstName']);
    });

    it('should extract column name from aggregate expression', () => {
      const selection = 'AVG("amount")';
      const result =
        ProcessAggregateHelper.extractColumnNamesFromAggregateExpression(
          selection,
        );

      expect(result).toEqual(['amount']);
    });

    it('should return null when no column names found', () => {
      const selection = 'COUNT(*)';
      const result =
        ProcessAggregateHelper.extractColumnNamesFromAggregateExpression(
          selection,
        );

      expect(result).toBeNull();
    });

    it('should extract column name from boolean expression', () => {
      const selection =
        'CASE WHEN "isActive"::boolean = TRUE THEN 1 ELSE NULL END';
      const result =
        ProcessAggregateHelper.extractColumnNamesFromAggregateExpression(
          selection,
        );

      expect(result).toEqual(['isActive']);
    });
  });
});
