import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateGroupByQueryVariablesFromBarOrLineChartConfiguration } from '@/page-layout/widgets/graph/utils/generateGroupByQueryVariablesFromBarOrLineChartConfiguration';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  AggregateOperations,
  type BarChartConfiguration,
  GraphType,
  type LineChartConfiguration,
} from '~/generated/graphql';

describe('generateGroupByQueryVariablesFromBarOrLineChartConfiguration', () => {
  const mockObjectMetadataItem: ObjectMetadataItem = {
    id: 'obj-1',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    fields: [
      {
        id: 'field-1',
        name: 'stage',
        type: FieldMetadataType.TEXT,
      },
      {
        id: 'field-2',
        name: 'owner',
        type: FieldMetadataType.RELATION,
      },
      {
        id: 'field-3',
        name: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
      },
      {
        id: 'field-4',
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
      },
    ],
  } as ObjectMetadataItem;

  const buildBarChartConfiguration = (
    overrides: Partial<BarChartConfiguration>,
  ): BarChartConfiguration =>
    ({
      __typename: 'BarChartConfiguration',
      aggregateFieldMetadataId: 'aggregate-field',
      aggregateOperation: AggregateOperations.COUNT,
      graphType: GraphType.VERTICAL_BAR,
      primaryAxisGroupByFieldMetadataId: 'field-1',
      ...overrides,
    }) as BarChartConfiguration;

  const buildLineChartConfiguration = (
    overrides: Partial<LineChartConfiguration>,
  ): LineChartConfiguration =>
    ({
      __typename: 'LineChartConfiguration',
      aggregateFieldMetadataId: 'aggregate-field',
      aggregateOperation: AggregateOperations.COUNT,
      graphType: GraphType.LINE,
      primaryAxisGroupByFieldMetadataId: 'field-1',
      ...overrides,
    }) as LineChartConfiguration;

  describe('Bar Chart Configuration', () => {
    describe('Vertical bar configuration', () => {
      it('should generate variables with single groupBy field', () => {
        const result =
          generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
            objectMetadataItem: mockObjectMetadataItem,
            chartConfiguration: buildBarChartConfiguration({
              graphType: GraphType.VERTICAL_BAR,
              primaryAxisGroupByFieldMetadataId: 'field-1',
              primaryAxisGroupBySubFieldName: null,
            }),
          });

        expect(result).toMatchSnapshot();
      });

      it('should generate variables with two groupBy fields', () => {
        const result =
          generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
            objectMetadataItem: mockObjectMetadataItem,
            chartConfiguration: buildBarChartConfiguration({
              graphType: GraphType.VERTICAL_BAR,
              primaryAxisGroupByFieldMetadataId: 'field-1',
              primaryAxisGroupBySubFieldName: null,
              secondaryAxisGroupByFieldMetadataId: 'field-2',
              secondaryAxisGroupBySubFieldName: null,
            }),
          });

        expect(result).toMatchSnapshot();
      });

      it('should generate variables with composite field', () => {
        const result =
          generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
            objectMetadataItem: mockObjectMetadataItem,
            chartConfiguration: buildBarChartConfiguration({
              graphType: GraphType.VERTICAL_BAR,
              primaryAxisGroupByFieldMetadataId: 'field-4',
              primaryAxisGroupBySubFieldName: 'firstName',
            }),
          });

        expect(result).toMatchSnapshot();
      });

      it('should generate variables with date field and granularity', () => {
        const result =
          generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
            objectMetadataItem: mockObjectMetadataItem,
            chartConfiguration: buildBarChartConfiguration({
              graphType: GraphType.VERTICAL_BAR,
              primaryAxisGroupByFieldMetadataId: 'field-3',
              primaryAxisGroupBySubFieldName: null,
              primaryAxisDateGranularity: 'MONTH' as any,
            }),
          });

        expect(result).toMatchSnapshot();
      });
    });

    describe('Horizontal bar configuration', () => {
      it('should generate variables with single groupBy field', () => {
        const result =
          generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
            objectMetadataItem: mockObjectMetadataItem,
            chartConfiguration: buildBarChartConfiguration({
              graphType: GraphType.HORIZONTAL_BAR,
              primaryAxisGroupByFieldMetadataId: 'field-1',
              primaryAxisGroupBySubFieldName: null,
            }),
          });

        expect(result).toMatchSnapshot();
      });

      it('should generate variables with secondary axis', () => {
        const result =
          generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
            objectMetadataItem: mockObjectMetadataItem,
            chartConfiguration: buildBarChartConfiguration({
              graphType: GraphType.HORIZONTAL_BAR,
              primaryAxisGroupByFieldMetadataId: 'field-1',
              secondaryAxisGroupByFieldMetadataId: 'field-2',
            }),
          });

        expect(result).toMatchSnapshot();
      });
    });
  });

  describe('Line Chart Configuration', () => {
    it('should generate variables with single groupBy field', () => {
      const result =
        generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
          objectMetadataItem: mockObjectMetadataItem,
          chartConfiguration: buildLineChartConfiguration({
            graphType: GraphType.LINE,
            primaryAxisGroupByFieldMetadataId: 'field-1',
            primaryAxisGroupBySubFieldName: null,
          }),
        });

      expect(result).toMatchSnapshot();
    });

    it('should generate variables with two groupBy fields (multi-series)', () => {
      const result =
        generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
          objectMetadataItem: mockObjectMetadataItem,
          chartConfiguration: buildLineChartConfiguration({
            graphType: GraphType.LINE,
            primaryAxisGroupByFieldMetadataId: 'field-1',
            primaryAxisGroupBySubFieldName: null,
            secondaryAxisGroupByFieldMetadataId: 'field-2',
            secondaryAxisGroupBySubFieldName: null,
          }),
        });

      expect(result).toMatchSnapshot();
    });

    it('should generate variables with date field and granularity', () => {
      const result =
        generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
          objectMetadataItem: mockObjectMetadataItem,
          chartConfiguration: buildLineChartConfiguration({
            graphType: GraphType.LINE,
            primaryAxisGroupByFieldMetadataId: 'field-3',
            primaryAxisGroupBySubFieldName: null,
            primaryAxisDateGranularity: 'MONTH' as any,
          }),
        });

      expect(result).toMatchSnapshot();
    });

    it('should generate variables with composite field', () => {
      const result =
        generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
          objectMetadataItem: mockObjectMetadataItem,
          chartConfiguration: buildLineChartConfiguration({
            graphType: GraphType.LINE,
            primaryAxisGroupByFieldMetadataId: 'field-4',
            primaryAxisGroupBySubFieldName: 'firstName',
          }),
        });

      expect(result).toMatchSnapshot();
    });

    it('should generate variables with secondary axis', () => {
      const result =
        generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
          objectMetadataItem: mockObjectMetadataItem,
          chartConfiguration: buildLineChartConfiguration({
            graphType: GraphType.LINE,
            primaryAxisGroupByFieldMetadataId: 'field-1',
            secondaryAxisGroupByFieldMetadataId: 'field-2',
          }),
        });

      expect(result).toMatchSnapshot();
    });
  });

  describe('Error handling', () => {
    it('should throw error when primary axis field not found (bar chart)', () => {
      expect(() =>
        generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
          objectMetadataItem: mockObjectMetadataItem,
          chartConfiguration: buildBarChartConfiguration({
            primaryAxisGroupByFieldMetadataId: 'invalid-field',
          }),
        }),
      ).toThrow('Field with id invalid-field not found in object metadata');
    });

    it('should throw error when primary axis field not found (line chart)', () => {
      expect(() =>
        generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
          objectMetadataItem: mockObjectMetadataItem,
          chartConfiguration: buildLineChartConfiguration({
            primaryAxisGroupByFieldMetadataId: 'invalid-field',
          }),
        }),
      ).toThrow('Field with id invalid-field not found in object metadata');
    });
  });
});
