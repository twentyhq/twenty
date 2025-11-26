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
      {
        id: 'field-address',
        name: 'address',
        type: FieldMetadataType.ADDRESS,
        label: 'Address',
      },
      {
        id: 'field-fullName',
        name: 'fullName',
        type: FieldMetadataType.FULL_NAME,
        label: 'Full Name',
      },
    ],
  } as ObjectMetadataItem;

  describe('Field-based sorting', () => {
    it('should sort ASC by groupBy field for Bar charts', () => {
      const config = {
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

    it('should sort DESC by groupBy field for Pie charts', () => {
      const config = {
        orderBy: GraphOrderBy.FIELD_DESC,
        groupByFieldMetadataId: 'field-status',
        aggregateFieldMetadataId: 'field-amount',
      } as PieChartConfiguration;

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([{ fieldName: 'status', direction: 'DESC' }]);
    });

    it('should return empty array when groupBy field not found', () => {
      const config = {
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

  describe('Value-based sorting', () => {
    it('should sort ASC by aggregate field', () => {
      const config = {
        primaryAxisOrderBy: GraphOrderBy.VALUE_ASC,
        primaryAxisGroupByFieldMetadataId: 'field-createdAt',
        aggregateFieldMetadataId: 'field-amount',
      } as BarChartConfiguration;

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([{ fieldName: 'amount', direction: 'ASC' }]);
    });

    it('should sort DESC by aggregate field for Pie charts', () => {
      const config = {
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

    it('should return empty array when aggregate field not found', () => {
      const config = {
        primaryAxisOrderBy: GraphOrderBy.VALUE_ASC,
        primaryAxisGroupByFieldMetadataId: 'field-createdAt',
        aggregateFieldMetadataId: 'non-existent',
      } as BarChartConfiguration;

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([]);
    });
  });

  describe('Composite field sorting', () => {
    it('should include subfield for address composite field in Bar chart', () => {
      const config = {
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        primaryAxisGroupByFieldMetadataId: 'field-address',
        primaryAxisGroupBySubFieldName: 'addressCity',
        aggregateFieldMetadataId: 'field-amount',
      } as BarChartConfiguration;

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([
        { fieldName: 'address.addressCity', direction: 'ASC' },
      ]);
    });

    it('should include subfield for fullName composite field in Pie chart', () => {
      const config = {
        orderBy: GraphOrderBy.FIELD_DESC,
        groupByFieldMetadataId: 'field-fullName',
        groupBySubFieldName: 'firstName',
        aggregateFieldMetadataId: 'field-amount',
      } as PieChartConfiguration;

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([
        { fieldName: 'fullName.firstName', direction: 'DESC' },
      ]);
    });

    it('should handle composite field without subfield', () => {
      const config = {
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        primaryAxisGroupByFieldMetadataId: 'field-address',
        primaryAxisGroupBySubFieldName: null,
        aggregateFieldMetadataId: 'field-amount',
      } as BarChartConfiguration;

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([{ fieldName: 'address', direction: 'ASC' }]);
    });

    it('should handle composite field with empty subfield', () => {
      const config = {
        primaryAxisOrderBy: GraphOrderBy.FIELD_DESC,
        primaryAxisGroupByFieldMetadataId: 'field-fullName',
        primaryAxisGroupBySubFieldName: '',
        aggregateFieldMetadataId: 'field-amount',
      } as BarChartConfiguration;

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([{ fieldName: 'fullName', direction: 'DESC' }]);
    });
  });

  describe('Edge cases', () => {
    it('should return empty array when orderBy is undefined', () => {
      const config = {
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
  });
});
