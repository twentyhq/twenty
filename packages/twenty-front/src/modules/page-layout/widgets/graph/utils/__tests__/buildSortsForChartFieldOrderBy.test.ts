import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { buildSortsForChartFieldOrderBy } from '@/page-layout/widgets/graph/utils/buildSortsForChartFieldOrderBy';
import { type NormalizedChartConfigurationFields } from '@/page-layout/widgets/graph/utils/normalizeChartConfigurationFields';
import { FieldMetadataType } from 'twenty-shared/types';
import { GraphOrderBy } from '~/generated/graphql';

describe('buildSortsForChartFieldOrderBy', () => {
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
    ],
  } as ObjectMetadataItem;

  it('should return ASC sort for FIELD_ASC orderBy', () => {
    const normalizedFields: NormalizedChartConfigurationFields = {
      groupByFieldMetadataId: 'field-createdAt',
      groupBySubFieldName: undefined,
      orderBy: GraphOrderBy.FIELD_ASC,
    };

    const result = buildSortsForChartFieldOrderBy({
      normalizedFields,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({ fieldName: 'createdAt', direction: 'ASC' });
  });

  it('should return DESC sort for FIELD_DESC orderBy', () => {
    const normalizedFields: NormalizedChartConfigurationFields = {
      groupByFieldMetadataId: 'field-status',
      groupBySubFieldName: undefined,
      orderBy: GraphOrderBy.FIELD_DESC,
    };

    const result = buildSortsForChartFieldOrderBy({
      normalizedFields,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({ fieldName: 'status', direction: 'DESC' });
  });

  it('should include subfield for composite fields', () => {
    const normalizedFields: NormalizedChartConfigurationFields = {
      groupByFieldMetadataId: 'field-address',
      groupBySubFieldName: 'addressCity',
      orderBy: GraphOrderBy.FIELD_ASC,
    };

    const result = buildSortsForChartFieldOrderBy({
      normalizedFields,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({
      fieldName: 'address.addressCity',
      direction: 'ASC',
    });
  });

  it('should handle composite field without subfield', () => {
    const normalizedFields: NormalizedChartConfigurationFields = {
      groupByFieldMetadataId: 'field-address',
      groupBySubFieldName: null,
      orderBy: GraphOrderBy.FIELD_ASC,
    };

    const result = buildSortsForChartFieldOrderBy({
      normalizedFields,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({ fieldName: 'address', direction: 'ASC' });
  });

  it('should return null when groupBy field not found', () => {
    const normalizedFields: NormalizedChartConfigurationFields = {
      groupByFieldMetadataId: 'non-existent',
      groupBySubFieldName: undefined,
      orderBy: GraphOrderBy.FIELD_ASC,
    };

    const result = buildSortsForChartFieldOrderBy({
      normalizedFields,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toBeNull();
  });
});
