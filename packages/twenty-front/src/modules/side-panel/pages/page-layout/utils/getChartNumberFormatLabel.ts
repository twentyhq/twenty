import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';
import { ChartNumberFormat } from '~/generated-metadata/graphql';

export const getChartNumberFormatLabel = (
  chartNumberFormat: ChartNumberFormat,
) => {
  switch (chartNumberFormat) {
    case ChartNumberFormat.SHORT:
      return t`Short`;
    case ChartNumberFormat.FULL:
      return t`Full`;
    default:
      assertUnreachable(chartNumberFormat);
  }
};
