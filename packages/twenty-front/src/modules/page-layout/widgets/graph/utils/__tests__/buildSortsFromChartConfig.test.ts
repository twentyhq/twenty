import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { buildSortsFromChartConfig } from '@/page-layout/widgets/graph/utils/buildSortsFromChartConfig';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
  GraphOrderBy,
} from '~/generated/graphql';
import { FieldMetadataType } from 'twenty-shared/types';

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

  const createBarChartConfig = (
    orderBy?: GraphOrderBy,
  ): BarChartConfiguration =>
    ({
      primaryAxisOrderBy: orderBy,
      primaryAxisGroupByFieldMetadataId: 'field-createdAt',
      aggregateFieldMetadataId: 'field-amount',
    }) as BarChartConfiguration;

  const createLineChartConfig = (
    orderBy?: GraphOrderBy,
  ): LineChartConfiguration =>
    ({
      primaryAxisOrderBy: orderBy,
      primaryAxisGroupByFieldMetadataId: 'field-createdAt',
      aggregateFieldMetadataId: 'field-amount',
    }) as LineChartConfiguration;

  const createPieChartConfig = (
    orderBy?: GraphOrderBy,
  ): PieChartConfiguration =>
    ({
      orderBy: orderBy,
      groupByFieldMetadataId: 'field-status',
      aggregateFieldMetadataId: 'field-amount',
    }) as PieChartConfiguration;

  describe('Bar and Line Charts', () => {
    describe('FIELD_ASC ordering', () => {
      it('should return ASC sort by primary field for BarChart', () => {
        const config = createBarChartConfig(GraphOrderBy.FIELD_ASC);

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([
          {
            fieldName: 'createdAt',
            direction: 'ASC',
          },
        ]);
      });

      it('should return ASC sort by primary field for LineChart', () => {
        const config = createLineChartConfig(GraphOrderBy.FIELD_ASC);

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([
          {
            fieldName: 'createdAt',
            direction: 'ASC',
          },
        ]);
      });

      it('should return empty array when primary field not found', () => {
        const config = {
          ...createBarChartConfig(GraphOrderBy.FIELD_ASC),
          primaryAxisGroupByFieldMetadataId: 'non-existent-field',
        };

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([]);
      });
    });

    describe('FIELD_DESC ordering', () => {
      it('should return DESC sort by primary field', () => {
        const config = createBarChartConfig(GraphOrderBy.FIELD_DESC);

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([
          {
            fieldName: 'createdAt',
            direction: 'DESC',
          },
        ]);
      });

      it('should return empty array when primary field not found', () => {
        const config = {
          ...createBarChartConfig(GraphOrderBy.FIELD_DESC),
          primaryAxisGroupByFieldMetadataId: 'bad-field-id',
        };

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([]);
      });
    });

    describe('VALUE_ASC ordering', () => {
      it('should return ASC sort by aggregate field', () => {
        const config = createBarChartConfig(GraphOrderBy.VALUE_ASC);

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([
          {
            fieldName: 'amount',
            direction: 'ASC',
          },
        ]);
      });

      it('should return empty array when aggregate field not found', () => {
        const config = {
          ...createBarChartConfig(GraphOrderBy.VALUE_ASC),
          aggregateFieldMetadataId: 'non-existent-aggregate',
        };

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([]);
      });
    });

    describe('VALUE_DESC ordering', () => {
      it('should return DESC sort by aggregate field', () => {
        const config = createBarChartConfig(GraphOrderBy.VALUE_DESC);

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([
          {
            fieldName: 'amount',
            direction: 'DESC',
          },
        ]);
      });

      it('should return empty array when aggregate field not found', () => {
        const config = {
          ...createBarChartConfig(GraphOrderBy.VALUE_DESC),
          aggregateFieldMetadataId: 'missing-field',
        };

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([]);
      });
    });
  });

  describe('Pie Charts', () => {
    describe('FIELD_ASC ordering', () => {
      it('should return ASC sort by group field for PieChart', () => {
        const config = createPieChartConfig(GraphOrderBy.FIELD_ASC);

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([
          {
            fieldName: 'status',
            direction: 'ASC',
          },
        ]);
      });

      it('should return empty array when group field not found', () => {
        const config = {
          ...createPieChartConfig(GraphOrderBy.FIELD_ASC),
          groupByFieldMetadataId: 'non-existent-field',
        };

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([]);
      });
    });

    describe('FIELD_DESC ordering', () => {
      it('should return DESC sort by group field', () => {
        const config = createPieChartConfig(GraphOrderBy.FIELD_DESC);

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([
          {
            fieldName: 'status',
            direction: 'DESC',
          },
        ]);
      });
    });

    describe('VALUE_ASC ordering', () => {
      it('should return ASC sort by aggregate field', () => {
        const config = createPieChartConfig(GraphOrderBy.VALUE_ASC);

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([
          {
            fieldName: 'amount',
            direction: 'ASC',
          },
        ]);
      });
    });

    describe('VALUE_DESC ordering', () => {
      it('should return DESC sort by aggregate field', () => {
        const config = createPieChartConfig(GraphOrderBy.VALUE_DESC);

        const result = buildSortsFromChartConfig({
          configuration: config,
          objectMetadataItem: mockObjectMetadataItem,
        });

        expect(result).toEqual([
          {
            fieldName: 'amount',
            direction: 'DESC',
          },
        ]);
      });
    });
  });

  describe('Undefined or null orderBy', () => {
    it('should return empty array when primaryAxisOrderBy is undefined for BarChart', () => {
      const config = createBarChartConfig(undefined);

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([]);
    });

    it('should return empty array when primaryAxisOrderBy is null for LineChart', () => {
      const config = createLineChartConfig(null as unknown as GraphOrderBy);

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([]);
    });

    it('should return empty array when orderBy is undefined for PieChart', () => {
      const config = createPieChartConfig(undefined);

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([]);
    });
  });

  describe('Different field types', () => {
    it('should work with SELECT field as primary axis', () => {
      const config = {
        ...createBarChartConfig(GraphOrderBy.FIELD_ASC),
        primaryAxisGroupByFieldMetadataId: 'field-status',
      };

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([
        {
          fieldName: 'status',
          direction: 'ASC',
        },
      ]);
    });

    it('should work with NUMBER field as aggregate', () => {
      const config = {
        ...createBarChartConfig(GraphOrderBy.VALUE_DESC),
        aggregateFieldMetadataId: 'field-amount',
      };

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([
        {
          fieldName: 'amount',
          direction: 'DESC',
        },
      ]);
    });

    it('should work with DATE_TIME field for PieChart group', () => {
      const config = {
        ...createPieChartConfig(GraphOrderBy.FIELD_ASC),
        groupByFieldMetadataId: 'field-createdAt',
      };

      const result = buildSortsFromChartConfig({
        configuration: config,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual([
        {
          fieldName: 'createdAt',
          direction: 'ASC',
        },
      ]);
    });
  });
});
