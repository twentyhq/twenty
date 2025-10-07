import { ChartGroupByFieldSelectionDropdownContentBase } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { t } from '@lingui/core/macro';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

export const ChartXAxisFieldSelectionDropdownContent = () => {
  return (
    <ChartGroupByFieldSelectionDropdownContentBase<
      BarChartConfiguration | LineChartConfiguration
    >
      headerLabel={t`X-Axis Field`}
      fieldMetadataIdKey="groupByFieldMetadataIdX"
      subFieldNameKey="groupBySubFieldNameX"
    />
  );
};
