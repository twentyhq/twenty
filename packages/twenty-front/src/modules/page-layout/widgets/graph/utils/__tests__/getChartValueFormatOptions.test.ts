import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getChartValueFormatOptions } from '@/page-layout/widgets/graph/utils/getChartValueFormatOptions';
import { formatGraphValue } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { FieldMetadataType } from 'twenty-shared/types';
import { ChartNumberFormat } from '~/generated-metadata/graphql';

describe('getChartValueFormatOptions', () => {
  const aggregateFieldMetadataItem = {
    id: 'score-field-id',
    type: FieldMetadataType.NUMBER,
    settings: {
      decimals: 2,
      type: 'number',
    },
  } as FieldMetadataItem;

  it('should honor the aggregate number field decimal setting', () => {
    const formatOptions = getChartValueFormatOptions({
      aggregateFieldMetadataId: aggregateFieldMetadataItem.id,
      fieldMetadataItems: [aggregateFieldMetadataItem],
      numberFormat: ChartNumberFormat.FULL,
    });

    expect(formatGraphValue(123.4567, formatOptions)).toBe('123.46');
  });

  it('should keep the short format compact', () => {
    const formatOptions = getChartValueFormatOptions({
      aggregateFieldMetadataId: aggregateFieldMetadataItem.id,
      fieldMetadataItems: [aggregateFieldMetadataItem],
      numberFormat: ChartNumberFormat.SHORT,
    });

    expect(formatGraphValue(123.4567, formatOptions)).toBe('123.5');
  });
});
