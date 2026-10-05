import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { DASHBOARD_AGGREGATE_OPERATION_RATIO } from '@/page-layout/widgets/graph/constants/DashboardAggregateOperationRatio';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { ListItem } from 'twenty-ui/primitives/navigation';

export const ChartRatioAggregateOperationSelectableListItem = ({
  label,
  onSelect,
}: {
  label: string;
  onSelect: () => void;
}) => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
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
      <ListItem
        focused={isFocused}
        onClick={onSelect}
        role="option"
        aria-selected={isCurrentlyRatio}
        selected={isCurrentlyRatio}
        indicator="check"
        hasSubmenu={true}
      >
        {label}
      </ListItem>
    </SelectableListItem>
  );
};
