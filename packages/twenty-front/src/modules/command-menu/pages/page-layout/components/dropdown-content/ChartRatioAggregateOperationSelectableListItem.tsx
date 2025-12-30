import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { DASHBOARD_AGGREGATE_OPERATION_RATIO } from '@/page-layout/widgets/graph/constants/DashboardAggregateOperationRatio';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { MenuItemSelect } from 'twenty-ui/navigation';

export const ChartRatioAggregateOperationSelectableListItem = ({
  label,
  onSelect,
}: {
  label: string;
  onSelect: () => void;
}) => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const isCurrentlyRatio =
    isWidgetConfigurationOfType(
      widgetInEditMode?.configuration,
      'AggregateChartConfiguration',
    ) && isDefined(widgetInEditMode.configuration.ratioAggregateConfig);

  const isFocused = selectedItemId === DASHBOARD_AGGREGATE_OPERATION_RATIO;

  return (
    <SelectableListItem
      itemId={DASHBOARD_AGGREGATE_OPERATION_RATIO}
      onEnter={onSelect}
    >
      <MenuItemSelect
        text={label}
        selected={isCurrentlyRatio}
        focused={isFocused}
        hasSubMenu={true}
        onClick={onSelect}
      />
    </SelectableListItem>
  );
};
