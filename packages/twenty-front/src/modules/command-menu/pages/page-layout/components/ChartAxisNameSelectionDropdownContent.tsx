import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import {
  getChartAxisNameOptions,
  type AxisNameOption,
} from '@/command-menu/pages/page-layout/utils/getChartAxisNameOptions';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { MenuItemSelect } from 'twenty-ui/navigation';

export const ChartAxisNameSelectionDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentAxisNameDisplay =
    widgetInEditMode?.configuration?.axisNameDisplay;

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const axisOptions: AxisNameOption[] = ['NONE', 'X', 'Y', 'BOTH'];

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const handleSelectAxisNameOption = (axisNameOption: AxisNameOption) => {
    updateCurrentWidgetConfig({
      axisNameDisplay: axisNameOption,
    });
    closeDropdown();
  };

  return (
    <>
      <DropdownMenuHeader>Axis Name</DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={axisOptions}
        >
          {axisOptions.map((option) => (
            <SelectableListItem
              key={option}
              itemId={option}
              onEnter={() => {
                handleSelectAxisNameOption(option);
              }}
            >
              <MenuItemSelect
                text={getChartAxisNameOptions(option)}
                selected={currentAxisNameDisplay?.toUpperCase() === option}
                focused={selectedItemId === option}
                onClick={() => {
                  handleSelectAxisNameOption(option);
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
