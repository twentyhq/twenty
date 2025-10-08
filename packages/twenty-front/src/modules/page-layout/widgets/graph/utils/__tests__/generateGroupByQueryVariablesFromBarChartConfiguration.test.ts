import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type BarChartConfiguration,
  FieldMetadataType,
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

  it('should generate variables with single groupBy field', () => {
    const result = generateGroupByQueryVariablesFromBarChartConfiguration({
      objectMetadataItem: mockObjectMetadataItem,
      barChartConfiguration: {
        groupByFieldMetadataIdX: 'field-1',
        groupBySubFieldNameX: null,
      } as BarChartConfiguration,
    });

    expect(result).toMatchSnapshot();
  });

  it('should generate variables with two groupBy fields', () => {
    const result = generateGroupByQueryVariablesFromBarChartConfiguration({
      objectMetadataItem: mockObjectMetadataItem,
      barChartConfiguration: {
        groupByFieldMetadataIdX: 'field-1',
        groupBySubFieldNameX: null,
        groupByFieldMetadataIdY: 'field-2',
        groupBySubFieldNameY: null,
      } as BarChartConfiguration,
    });

    expect(result).toMatchSnapshot();
  });

  it('should generate variables with composite field', () => {
    const result = generateGroupByQueryVariablesFromBarChartConfiguration({
      objectMetadataItem: mockObjectMetadataItem,
      barChartConfiguration: {
        groupByFieldMetadataIdX: 'field-4',
        groupBySubFieldNameX: 'firstName',
      } as BarChartConfiguration,
    });

    expect(result).toMatchSnapshot();
  });

  it('should throw error when groupBy field X not found', () => {
    expect(() =>
      generateGroupByQueryVariablesFromBarChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        barChartConfiguration: {
          groupByFieldMetadataIdX: 'invalid-field',
          groupBySubFieldNameX: null,
        } as BarChartConfiguration,
      }),
    ).toThrow('Field with id invalid-field not found in object metadata');
  });
});
