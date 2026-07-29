import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getChartValueDisplayType } from '@/page-layout/widgets/graph/utils/getChartValueDisplayType';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { FieldMetadataType } from 'twenty-shared/types';
import { findById, isDefined } from 'twenty-shared/utils';
import { type ChartNumberFormat } from '~/generated-metadata/graphql';

type GetChartValueFormatOptionsParams = {
  aggregateFieldMetadataId: string;
  fieldMetadataItems: FieldMetadataItem[];
  numberFormat: ChartNumberFormat | null | undefined;
};

export const getChartValueFormatOptions = ({
  aggregateFieldMetadataId,
  fieldMetadataItems,
  numberFormat,
}: GetChartValueFormatOptionsParams): GraphValueFormatOptions => {
  const aggregateFieldMetadataItem = fieldMetadataItems.find(
    findById(aggregateFieldMetadataId),
  );

  const aggregateFieldSettings =
    aggregateFieldMetadataItem?.type === FieldMetadataType.NUMBER
      ? aggregateFieldMetadataItem.settings
      : undefined;

  const decimals =
    isDefined(aggregateFieldSettings) && 'decimals' in aggregateFieldSettings
      ? aggregateFieldSettings.decimals
      : undefined;

  return {
    decimals,
    displayType: getChartValueDisplayType(numberFormat),
  };
};
