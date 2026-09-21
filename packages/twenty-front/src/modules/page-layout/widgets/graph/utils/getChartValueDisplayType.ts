import { CHART_NUMBER_FORMAT_DEFAULT } from '@/page-layout/widgets/graph/constants/ChartNumberFormatDefault';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { ChartNumberFormat } from '~/generated-metadata/graphql';

export const getChartValueDisplayType = (
  numberFormat: ChartNumberFormat | null | undefined,
): GraphValueFormatOptions['displayType'] =>
  (numberFormat ?? CHART_NUMBER_FORMAT_DEFAULT) === ChartNumberFormat.FULL
    ? 'number'
    : 'shortNumber';
