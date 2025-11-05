import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  AggregateOperations,
  type LineChartConfiguration,
  FieldMetadataType,
  GraphType,
} from '~/generated-metadata/graphql';
import { generateGroupByQueryVariablesFromLineChartConfiguration } from '../generateGroupByQueryVariablesFromLineChartConfiguration';

describe('generateGroupByQueryVariablesFromLineChartConfiguration', () => {
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

  const buildConfiguration = (
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

  describe('Line chart configuration', () => {
    it('should generate variables with single groupBy field', () => {
      const result = generateGroupByQueryVariablesFromLineChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        lineChartConfiguration: buildConfiguration({
          graphType: GraphType.LINE,
          primaryAxisGroupByFieldMetadataId: 'field-1',
          primaryAxisGroupBySubFieldName: null,
        }),
      });

      expect(result).toMatchSnapshot();
    });

    it('should generate variables with two groupBy fields (multi-series)', () => {
      const result = generateGroupByQueryVariablesFromLineChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        lineChartConfiguration: buildConfiguration({
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
      const result = generateGroupByQueryVariablesFromLineChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        lineChartConfiguration: buildConfiguration({
          graphType: GraphType.LINE,
          primaryAxisGroupByFieldMetadataId: 'field-3',
          primaryAxisGroupBySubFieldName: null,
          primaryAxisDateGranularity: 'MONTH' as any,
        }),
      });

      expect(result).toMatchSnapshot();
    });

    it('should generate variables with composite field', () => {
      const result = generateGroupByQueryVariablesFromLineChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        lineChartConfiguration: buildConfiguration({
          graphType: GraphType.LINE,
          primaryAxisGroupByFieldMetadataId: 'field-4',
          primaryAxisGroupBySubFieldName: 'firstName',
        }),
      });

      expect(result).toMatchSnapshot();
    });

    it('should generate variables with secondary axis', () => {
      const result = generateGroupByQueryVariablesFromLineChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        lineChartConfiguration: buildConfiguration({
          graphType: GraphType.LINE,
          primaryAxisGroupByFieldMetadataId: 'field-1',
          secondaryAxisGroupByFieldMetadataId: 'field-2',
        }),
      });

      expect(result).toMatchSnapshot();
    });
  });

  it('should throw error when primary axis field not found', () => {
    expect(() =>
      generateGroupByQueryVariablesFromLineChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        lineChartConfiguration: buildConfiguration({
          primaryAxisGroupByFieldMetadataId: 'invalid-field',
        }),
      }),
    ).toThrow('Field with id invalid-field not found in object metadata');
  });
});
