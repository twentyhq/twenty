import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateGroupByQueryVariablesFromPieChartConfiguration } from '@/page-layout/widgets/graph/utils/generateGroupByQueryVariablesFromPieChartConfiguration';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import {
  AggregateOperations,
  FieldMetadataType,
  GraphOrderBy,
  WidgetConfigurationType,
  type PieChartConfiguration,
} from '~/generated-metadata/graphql';

describe('generateGroupByQueryVariablesFromPieChartConfiguration', () => {
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

  const buildPieChartConfiguration = (
    overrides: Partial<PieChartConfiguration>,
  ): PieChartConfiguration =>
    ({
      __typename: 'PieChartConfiguration',
      aggregateFieldMetadataId: 'aggregate-field',
      aggregateOperation: AggregateOperations.COUNT,
      configurationType: WidgetConfigurationType.PIE_CHART,
      groupByFieldMetadataId: 'field-1',
      ...overrides,
    }) as PieChartConfiguration;

  describe('Basic Configuration', () => {
    it('should generate variables with single groupBy field', () => {
      const result = generateGroupByQueryVariablesFromPieChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        objectMetadataItems: [],
        chartConfiguration: buildPieChartConfiguration({
          groupByFieldMetadataId: 'field-1',
          groupBySubFieldName: null,
        }),
      });

      expect(result).toMatchSnapshot();
    });

    it('should generate variables with composite field', () => {
      const result = generateGroupByQueryVariablesFromPieChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        objectMetadataItems: [],
        chartConfiguration: buildPieChartConfiguration({
          groupByFieldMetadataId: 'field-4',
          groupBySubFieldName: 'firstName',
        }),
      });

      expect(result).toMatchSnapshot();
    });

    it('should generate variables with date field and granularity', () => {
      const result = generateGroupByQueryVariablesFromPieChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        objectMetadataItems: [],
        chartConfiguration: buildPieChartConfiguration({
          groupByFieldMetadataId: 'field-3',
          groupBySubFieldName: null,
          dateGranularity: 'MONTH' as any,
        }),
        userTimeZone: 'Europe/Paris',
      });

      expect(result).toMatchSnapshot();
    });

    it('should generate variables with limit', () => {
      const result = generateGroupByQueryVariablesFromPieChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        objectMetadataItems: [],
        chartConfiguration: buildPieChartConfiguration({
          groupByFieldMetadataId: 'field-1',
        }),
        limit: 10,
      });

      expect(result).toMatchSnapshot();
      expect(result.limit).toBe(10);
    });

    it('should generate variables with orderBy', () => {
      const result = generateGroupByQueryVariablesFromPieChartConfiguration({
        objectMetadataItem: mockObjectMetadataItem,
        objectMetadataItems: [],
        chartConfiguration: buildPieChartConfiguration({
          groupByFieldMetadataId: 'field-1',
          orderBy: GraphOrderBy.VALUE_ASC,
        }),
        aggregateOperation: 'count',
      });

      expect(result).toMatchSnapshot();
      expect(result.orderBy).toBeDefined();
    });
  });

  describe('Relation date subfield', () => {
    it('applies date granularity when grouping by a relation date subfield', () => {
      const relationField = {
        id: 'field-rel',
        name: 'company',
        type: FieldMetadataType.RELATION,
        relation: { targetObjectMetadata: { nameSingular: 'company' } },
      };

      const mainObjectMetadata: ObjectMetadataItem = {
        id: 'obj-main',
        nameSingular: 'opportunity',
        namePlural: 'opportunities',
        fields: [relationField],
      } as ObjectMetadataItem;

      const targetObjectMetadata: ObjectMetadataItem = {
        id: 'obj-company',
        nameSingular: 'company',
        namePlural: 'companies',
        fields: [
          {
            id: 'company-created-at',
            name: 'createdAt',
            type: FieldMetadataType.DATE_TIME,
          },
        ],
      } as ObjectMetadataItem;

      const result = generateGroupByQueryVariablesFromPieChartConfiguration({
        objectMetadataItem: mainObjectMetadata,
        objectMetadataItems: [mainObjectMetadata, targetObjectMetadata],
        chartConfiguration: buildPieChartConfiguration({
          groupByFieldMetadataId: relationField.id,
          groupBySubFieldName: 'createdAt',
        }),
        userTimeZone: 'Europe/Paris',
      });

      expect(result.groupBy[0]).toEqual({
        company: {
          createdAt: {
            granularity: ObjectRecordGroupByDateGranularity.DAY,
            timeZone: 'Europe/Paris',
          },
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when groupBy field not found', () => {
      expect(() =>
        generateGroupByQueryVariablesFromPieChartConfiguration({
          objectMetadataItem: mockObjectMetadataItem,
          objectMetadataItems: [],
          chartConfiguration: buildPieChartConfiguration({
            groupByFieldMetadataId: 'invalid-field',
          }),
        }),
      ).toThrow('Field with id invalid-field not found in object metadata');
    });
  });
});
