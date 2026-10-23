import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconCheck } from 'twenty-ui/icon';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { getChartAggregateDropdownPageId } from '@/side-panel/pages/page-layout/utils/getChartAggregateDropdownPageId';

type ChartRatioAggregateOperationSelectableListItemProps = {
  label: string;
  currentFieldMetadataId: string;
};

export const ChartRatioAggregateOperationSelectableListItem = ({
  label,
  currentFieldMetadataId,
}: ChartRatioAggregateOperationSelectableListItemProps) => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const isCurrentlyRatio =
    isWidgetConfigurationOfType(
      widgetInEditMode?.configuration,
      'AggregateChartConfiguration',
    ) && isDefined(widgetInEditMode.configuration.ratioAggregateConfig);

  return (
    <Dropdown.ActionItem
      page={getChartAggregateDropdownPageId({
        fieldMetadataId: currentFieldMetadataId,
        page: 'ratio',
      })}
      aria-current={isCurrentlyRatio ? 'true' : undefined}
      endIcon={
        isCurrentlyRatio ? <SelectOptionIcon Icon={IconCheck} /> : undefined
      }
    >
      {label}
    </Dropdown.ActionItem>
  );
};
