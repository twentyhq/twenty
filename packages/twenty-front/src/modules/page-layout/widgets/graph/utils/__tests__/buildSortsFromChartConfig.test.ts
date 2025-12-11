import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { buildSortsFromChartConfig } from '@/page-layout/widgets/graph/utils/buildSortsFromChartConfig';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  type BarChartConfiguration,
  type PieChartConfiguration,
  GraphOrderBy,
} from '~/generated/graphql';

describe('buildSortsFromChartConfig', () => {
  const mockObjectMetadataItem: ObjectMetadataItem = {
    id: 'obj-1',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    fields: [
      {
        id: 'field-status',
        name: 'status',
        type: FieldMetadataType.SELECT,
        label: 'Status',
      },
      {
        id: 'field-amount',
        name: 'amount',
        type: FieldMetadataType.NUMBER,
        label: 'Amount',
      },
      {
        id: 'field-createdAt',
        name: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        label: 'Created At',
      },
    ],
  } as ObjectMetadataItem;

  describe('integration', () => {
    it('should handle field-based sorting end-to-end for Bar charts', () => {
      const config = {
        __typename: 'BarChartConfiguration',
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        primaryAxisGroupByFieldMetadataId: 'field-createdAt',
        aggregateFieldMetadataId: 'field-amount',
      } as BarChartConfiguration;

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([{ fieldName: 'createdAt', direction: 'ASC' }]);
    });

    it('should handle value-based sorting end-to-end for Pie charts', () => {
      const config = {
        __typename: 'PieChartConfiguration',
        orderBy: GraphOrderBy.VALUE_DESC,
        groupByFieldMetadataId: 'field-status',
        aggregateFieldMetadataId: 'field-amount',
      } as PieChartConfiguration;

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([{ fieldName: 'amount', direction: 'DESC' }]);
    });
  });

  describe('edge cases', () => {
    it('should return empty array when orderBy is undefined', () => {
      const config = {
        __typename: 'BarChartConfiguration',
        primaryAxisOrderBy: undefined,
        primaryAxisGroupByFieldMetadataId: 'field-createdAt',
        aggregateFieldMetadataId: 'field-amount',
      } as BarChartConfiguration;

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([]);
    });

    it('should return empty array when orderBy is null', () => {
      const config = {
        __typename: 'PieChartConfiguration',
        orderBy: null,
        groupByFieldMetadataId: 'field-status',
        aggregateFieldMetadataId: 'field-amount',
      } as PieChartConfiguration;

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([]);
    });

    it('should return empty array when field not found', () => {
      const config = {
        __typename: 'BarChartConfiguration',
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        primaryAxisGroupByFieldMetadataId: 'non-existent',
        aggregateFieldMetadataId: 'field-amount',
      } as BarChartConfiguration;

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([]);
    });
  });
});
