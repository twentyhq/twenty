import { ChartGroupByFieldSelectionDropdownContentBase } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { t } from '@lingui/core/macro';
import { type PieChartConfiguration } from '~/generated/graphql';

export const ChartPieFieldSelectionDropdownContent = () => {
  return (
    <ChartGroupByFieldSelectionDropdownContentBase<PieChartConfiguration>
      headerLabel={t`Each slice represents`}
      fieldMetadataIdKey="groupByFieldMetadataId"
      subFieldNameKey="groupBySubFieldName"
    />
  );
};
