import { ChartGroupByFieldSelectionDropdownContentBase } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { Trans } from '@lingui/react/macro';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

export const ChartGroupByFieldSelectionDropdownContent = () => {
  return (
    <ChartGroupByFieldSelectionDropdownContentBase<
      BarChartConfiguration | LineChartConfiguration
    >
      headerLabel={<Trans>Y-Axis Group By Field</Trans>}
      fieldMetadataIdKey="groupByFieldMetadataIdY"
      subFieldNameKey="groupBySubFieldNameY"
    />
  );
};
