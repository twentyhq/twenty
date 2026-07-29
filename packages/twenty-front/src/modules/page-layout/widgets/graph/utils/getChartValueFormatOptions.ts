import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/nonStandardAggregateOperationsOptions';
import { getChartValueDisplayType } from '@/page-layout/widgets/graph/utils/getChartValueDisplayType';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { FieldMetadataType } from 'twenty-shared/types';
import { findById, isDefined } from 'twenty-shared/utils';
import {
  type AggregateOperations as GeneratedAggregateOperations,
  type ChartNumberFormat,
} from '~/generated-metadata/graphql';

type GetChartValueFormatOptionsParams = {
  aggregateOperation: GeneratedAggregateOperations;
  aggregateFieldMetadataId: string;
  fieldMetadataItems: FieldMetadataItem[];
  numberFormat: ChartNumberFormat | null | undefined;
};

export const getChartValueFormatOptions = ({
  aggregateOperation,
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

  const shouldUseAggregateFieldDecimals =
    NON_STANDARD_AGGREGATE_OPERATION_OPTIONS.includes(
      aggregateOperation as AggregateOperations,
    );

  const decimals =
    shouldUseAggregateFieldDecimals &&
    isDefined(aggregateFieldSettings) &&
    'decimals' in aggregateFieldSettings
      ? aggregateFieldSettings.decimals
      : undefined;

  return {
    decimals,
    displayType: getChartValueDisplayType(numberFormat),
  };
};
