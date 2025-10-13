import { ChartGroupByFieldSelectionDropdownContentBase } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

export const ChartXAxisFieldSelectionDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const configuration = widgetInEditMode?.configuration;

  if (configuration?.__typename === 'BarChartConfiguration') {
    return (
      <ChartGroupByFieldSelectionDropdownContentBase<BarChartConfiguration>
        fieldMetadataIdKey="primaryAxisGroup"
        subFieldNameKey="primaryAxisSubFieldName"
      />
    );
  }

  if (configuration?.__typename === 'LineChartConfiguration') {
    return (
      <ChartGroupByFieldSelectionDropdownContentBase<LineChartConfiguration>
        fieldMetadataIdKey="groupByFieldMetadataIdX"
        subFieldNameKey="groupBySubFieldNameX"
      />
    );
  }

  throw new Error('Invalid configuration type');
};
