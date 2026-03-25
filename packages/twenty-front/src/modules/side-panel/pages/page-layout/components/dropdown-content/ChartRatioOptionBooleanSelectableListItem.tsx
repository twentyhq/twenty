import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { IconCheck, IconX } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { AggregateOperations } from '~/generated-metadata/graphql';

export const ChartRatioOptionBooleanSelectableListItem = ({
  optionValue,
  label,
  currentFieldMetadataId,
}: {
  optionValue: string;
  label: string;
  currentFieldMetadataId: string;
}) => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { closeDropdown } = useCloseDropdown();

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const currentRatioConfig = isWidgetConfigurationOfType(
    widgetInEditMode?.configuration,
    'AggregateChartConfiguration',
  )
    ? widgetInEditMode.configuration.ratioAggregateConfig
    : undefined;

  const isSelected = currentRatioConfig?.optionValue === optionValue;
  const isFocused = selectedItemId === optionValue;

  const handleClick = () => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        aggregateFieldMetadataId: currentFieldMetadataId,
        aggregateOperation: AggregateOperations.COUNT,
        ratioAggregateConfig: {
          fieldMetadataId: currentFieldMetadataId,
          optionValue,
        },
      },
    });
    closeDropdown();
  };

  return (
    <SelectableListItem itemId={optionValue} onEnter={handleClick}>
      <MenuItemSelect
        text={label}
        LeftIcon={optionValue === 'true' ? IconCheck : IconX}
        selected={isSelected}
        focused={isFocused}
        onClick={handleClick}
      />
    </SelectableListItem>
  );
};
