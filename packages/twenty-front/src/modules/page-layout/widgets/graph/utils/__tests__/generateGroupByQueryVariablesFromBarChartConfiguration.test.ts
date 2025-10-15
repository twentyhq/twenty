import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type BarChartConfiguration,
  ExtendedAggregateOperations,
  FieldMetadataType,
  GraphType,
} from '~/generated-metadata/graphql';
import { generateGroupByQueryVariablesFromBarChartConfiguration } from '../generateGroupByQueryVariablesFromBarChartConfiguration';

describe('generateGroupByQueryVariablesFromBarChartConfiguration', () => {
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
    overrides: Partial<BarChartConfiguration>,
  ): BarChartConfiguration =>
    ({
      __typename: 'BarChartConfiguration',
      aggregateFieldMetadataId: 'aggregate-field',
      aggregateOperation: ExtendedAggregateOperations.COUNT,
      graphType: GraphType.VERTICAL_BAR,
      primaryAxisGroupByFieldMetadataId: 'field-1',
      ...overrides,
    }) as BarChartConfiguration;

  describe('Vertical bar configuration', () => {
    it('should generate variables with single groupBy field', () => {
      const result = generateGroupByQueryVariablesFromBarChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        barChartConfiguration: buildConfiguration({
          graphType: GraphType.VERTICAL_BAR,
          primaryAxisGroupByFieldMetadataId: 'field-1',
          primaryAxisGroupBySubFieldName: null,
        }),
      });

      expect(result).toMatchSnapshot();
    });

    it('should generate variables with two groupBy fields', () => {
      const result = generateGroupByQueryVariablesFromBarChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        barChartConfiguration: buildConfiguration({
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
      const result = generateGroupByQueryVariablesFromBarChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        barChartConfiguration: buildConfiguration({
          graphType: GraphType.VERTICAL_BAR,
          primaryAxisGroupByFieldMetadataId: 'field-4',
          primaryAxisGroupBySubFieldName: 'firstName',
        }),
      });

      expect(result).toMatchSnapshot();
    });
  });

  describe('Horizontal bar configuration', () => {
    it('should generate variables with single groupBy field', () => {
      const result = generateGroupByQueryVariablesFromBarChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        barChartConfiguration: buildConfiguration({
          graphType: GraphType.HORIZONTAL_BAR,
          primaryAxisGroupByFieldMetadataId: 'field-1',
          primaryAxisGroupBySubFieldName: null,
        }),
      });

      expect(result).toMatchSnapshot();
    });

    it('should generate variables with secondary axis', () => {
      const result = generateGroupByQueryVariablesFromBarChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        barChartConfiguration: buildConfiguration({
          graphType: GraphType.HORIZONTAL_BAR,
          primaryAxisGroupByFieldMetadataId: 'field-1',
          secondaryAxisGroupByFieldMetadataId: 'field-2',
        }),
      });

      expect(result).toMatchSnapshot();
    });
  });

  it('should throw error when primary axis field not found', () => {
    expect(() =>
      generateGroupByQueryVariablesFromBarChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        barChartConfiguration: buildConfiguration({
          primaryAxisGroupByFieldMetadataId: 'invalid-field',
        }),
      }),
    ).toThrow('Field with id invalid-field not found in object metadata');
  });
});
