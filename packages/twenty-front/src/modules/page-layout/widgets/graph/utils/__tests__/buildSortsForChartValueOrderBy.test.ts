import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { buildSortsForChartValueOrderBy } from '@/page-layout/widgets/graph/utils/buildSortsForChartValueOrderBy';
import { type NormalizedChartConfigurationFields } from '@/page-layout/widgets/graph/utils/normalizeChartConfigurationFields';
import { FieldMetadataType } from 'twenty-shared/types';
import { GraphOrderBy } from '~/generated/graphql';

describe('buildSortsForChartValueOrderBy', () => {
  const mockObjectMetadataItem: ObjectMetadataItem = {
    id: 'obj-1',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    fields: [
      {
        id: 'field-amount',
        name: 'amount',
        type: FieldMetadataType.NUMBER,
        label: 'Amount',
      },
    ],
  } as ObjectMetadataItem;

  it('should return ASC sort for VALUE_ASC orderBy', () => {
    const normalizedFields: NormalizedChartConfigurationFields = {
      groupByFieldMetadataId: 'some-field',
      groupBySubFieldName: undefined,
      orderBy: GraphOrderBy.VALUE_ASC,
    };

    const result = buildSortsForChartValueOrderBy({
      normalizedFields,
      aggregateFieldMetadataId: 'field-amount',
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({ fieldName: 'amount', direction: 'ASC' });
  });

  it('should return DESC sort for VALUE_DESC orderBy', () => {
    const normalizedFields: NormalizedChartConfigurationFields = {
      groupByFieldMetadataId: 'some-field',
      groupBySubFieldName: undefined,
      orderBy: GraphOrderBy.VALUE_DESC,
    };

    const result = buildSortsForChartValueOrderBy({
      normalizedFields,
      aggregateFieldMetadataId: 'field-amount',
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({ fieldName: 'amount', direction: 'DESC' });
  });

  it('should return null when aggregate field not found', () => {
    const normalizedFields: NormalizedChartConfigurationFields = {
      groupByFieldMetadataId: 'some-field',
      groupBySubFieldName: undefined,
      orderBy: GraphOrderBy.VALUE_ASC,
    };

    const result = buildSortsForChartValueOrderBy({
      normalizedFields,
      aggregateFieldMetadataId: 'non-existent',
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toBeNull();
  });
});
