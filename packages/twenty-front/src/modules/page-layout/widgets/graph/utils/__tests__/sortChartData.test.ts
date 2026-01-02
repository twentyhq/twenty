import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { sortChartData } from '@/page-layout/widgets/graph/utils/sortChartData';
import { GraphOrderBy } from '~/generated/graphql';

describe('sortChartData', () => {
  type TestDataPoint = { label: string; value: number };

  const testData: TestDataPoint[] = [
    { label: 'Beta', value: 30 },
    { label: 'Alpha', value: 10 },
    { label: 'Gamma', value: 20 },
  ];

  const formattedToRawLookup = new Map<string, RawDimensionValue>([
    ['Alpha', 'ALPHA'],
    ['Beta', 'BETA'],
    ['Gamma', 'GAMMA'],
  ]);

  const getFieldValue = (item: TestDataPoint) => item.label;
  const getNumericValue = (item: TestDataPoint) => item.value;

  describe('null or undefined orderBy', () => {
    it('should return data unchanged when orderBy is null', () => {
      const result = sortChartData({
        data: testData,
        orderBy: null,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result).toEqual(testData);
    });

    it('should return data unchanged when orderBy is undefined', () => {
      const result = sortChartData({
        data: testData,
        orderBy: undefined,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result).toEqual(testData);
    });
  });

  describe('FIELD_ASC sorting', () => {
    it('should sort by field value ascending', () => {
      const result = sortChartData({
        data: testData,
        orderBy: GraphOrderBy.FIELD_ASC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result.map((item) => item.label)).toEqual([
        'Alpha',
        'Beta',
        'Gamma',
      ]);
    });
  });

  describe('FIELD_DESC sorting', () => {
    it('should sort by field value descending', () => {
      const result = sortChartData({
        data: testData,
        orderBy: GraphOrderBy.FIELD_DESC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result.map((item) => item.label)).toEqual([
        'Gamma',
        'Beta',
        'Alpha',
      ]);
    });
  });

  describe('VALUE_ASC sorting', () => {
    it('should sort by numeric value ascending', () => {
      const result = sortChartData({
        data: testData,
        orderBy: GraphOrderBy.VALUE_ASC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result.map((item) => item.value)).toEqual([10, 20, 30]);
    });
  });

  describe('VALUE_DESC sorting', () => {
    it('should sort by numeric value descending', () => {
      const result = sortChartData({
        data: testData,
        orderBy: GraphOrderBy.VALUE_DESC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result.map((item) => item.value)).toEqual([30, 20, 10]);
    });
  });

  describe('MANUAL sorting', () => {
    it('should sort by manual order', () => {
      const manualSortOrder = ['GAMMA', 'ALPHA', 'BETA'];

      const result = sortChartData({
        data: testData,
        orderBy: GraphOrderBy.MANUAL,
        manualSortOrder,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result.map((item) => item.label)).toEqual([
        'Gamma',
        'Alpha',
        'Beta',
      ]);
    });

    it('should return data unchanged when manual order is undefined', () => {
      const result = sortChartData({
        data: testData,
        orderBy: GraphOrderBy.MANUAL,
        manualSortOrder: undefined,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result).toEqual(testData);
    });

    it('should return data unchanged when manual order is null', () => {
      const result = sortChartData({
        data: testData,
        orderBy: GraphOrderBy.MANUAL,
        manualSortOrder: null,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result).toEqual(testData);
    });
  });

  describe('FIELD_POSITION_ASC sorting', () => {
    const selectFieldOptions: FieldMetadataItemOption[] = [
      { id: '1', value: 'ALPHA', label: 'Alpha', position: 2, color: 'blue' },
      { id: '2', value: 'BETA', label: 'Beta', position: 0, color: 'red' },
      { id: '3', value: 'GAMMA', label: 'Gamma', position: 1, color: 'green' },
    ];

    it('should sort by select option position ascending', () => {
      const result = sortChartData({
        data: testData,
        orderBy: GraphOrderBy.FIELD_POSITION_ASC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
        selectFieldOptions,
      });

      expect(result.map((item) => item.label)).toEqual([
        'Beta',
        'Gamma',
        'Alpha',
      ]);
    });

    it('should throw error when select options are not provided', () => {
      expect(() =>
        sortChartData({
          data: testData,
          orderBy: GraphOrderBy.FIELD_POSITION_ASC,
          formattedToRawLookup,
          getFieldValue,
          getNumericValue,
        }),
      ).toThrow('Select field options are required');
    });

    it('should throw error when select options are empty', () => {
      expect(() =>
        sortChartData({
          data: testData,
          orderBy: GraphOrderBy.FIELD_POSITION_ASC,
          formattedToRawLookup,
          getFieldValue,
          getNumericValue,
          selectFieldOptions: [],
        }),
      ).toThrow('Select field options are required');
    });
  });

  describe('FIELD_POSITION_DESC sorting', () => {
    const selectFieldOptions: FieldMetadataItemOption[] = [
      { id: '1', value: 'ALPHA', label: 'Alpha', position: 2, color: 'blue' },
      { id: '2', value: 'BETA', label: 'Beta', position: 0, color: 'red' },
      { id: '3', value: 'GAMMA', label: 'Gamma', position: 1, color: 'green' },
    ];

    it('should sort by select option position descending', () => {
      const result = sortChartData({
        data: testData,
        orderBy: GraphOrderBy.FIELD_POSITION_DESC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
        selectFieldOptions,
      });

      expect(result.map((item) => item.label)).toEqual([
        'Alpha',
        'Gamma',
        'Beta',
      ]);
    });
  });

  describe('immutability', () => {
    it('should not mutate the original data array', () => {
      const originalData = [...testData];

      sortChartData({
        data: testData,
        orderBy: GraphOrderBy.FIELD_ASC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(testData).toEqual(originalData);
    });
  });
});
