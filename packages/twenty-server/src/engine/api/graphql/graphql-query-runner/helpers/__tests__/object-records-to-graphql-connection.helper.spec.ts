import { ObjectRecordsToGraphqlConnectionHelper } from '../object-records-to-graphql-connection.helper';

describe('ObjectRecordsToGraphqlConnectionHelper', () => {
  const mockObjectMetadataMaps = {
    byId: {},
    byNameSingular: {},
    byNamePlural: {},
  };

  describe('extractAggregatedFieldsValues', () => {
    it('should convert NaN values to null', () => {
      const helper = new ObjectRecordsToGraphqlConnectionHelper(
        mockObjectMetadataMaps,
      );

      const selectedAggregatedFields = {
        avgEmployees: [],
        avgRevenue: [],
        totalCount: [],
      };

      const objectRecordsAggregatedValues = {
        avgEmployees: NaN,
        avgRevenue: 100.5,
        totalCount: 42,
      };

      // Use reflection to access the private method for testing
      const result = (helper as any).extractAggregatedFieldsValues({
        selectedAggregatedFields,
        objectRecordsAggregatedValues,
      });

      expect(result).toEqual({
        avgEmployees: null, // NaN should be converted to null
        avgRevenue: 100.5, // Normal numbers should pass through
        totalCount: 42,
      });
    });

    it('should handle null and undefined values correctly', () => {
      const helper = new ObjectRecordsToGraphqlConnectionHelper(
        mockObjectMetadataMaps,
      );

      const selectedAggregatedFields = {
        avgEmployees: [],
        maxSalary: [],
      };

      const objectRecordsAggregatedValues = {
        avgEmployees: null,
        maxSalary: undefined,
      };

      const result = (helper as any).extractAggregatedFieldsValues({
        selectedAggregatedFields,
        objectRecordsAggregatedValues,
      });

      // null should be omitted (isDefined check)
      // undefined should be omitted (isDefined check)
      expect(result).toEqual({});
    });

    it('should handle zero and negative numbers correctly', () => {
      const helper = new ObjectRecordsToGraphqlConnectionHelper(
        mockObjectMetadataMaps,
      );

      const selectedAggregatedFields = {
        avgBalance: [],
        minValue: [],
      };

      const objectRecordsAggregatedValues = {
        avgBalance: 0,
        minValue: -42.5,
      };

      const result = (helper as any).extractAggregatedFieldsValues({
        selectedAggregatedFields,
        objectRecordsAggregatedValues,
      });

      expect(result).toEqual({
        avgBalance: 0, // Zero should pass through
        minValue: -42.5, // Negative numbers should pass through
      });
    });
  });
});
