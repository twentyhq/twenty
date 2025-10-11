import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { getChartGraphLayoutOptions } from '@/command-menu/pages/page-layout/utils/getChartGraphLayoutOptions';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { GraphLayoutType } from '~/generated/graphql';

export const ChartGraphLayoutSelectionDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (widgetInEditMode?.configuration?.__typename !== 'BarChartConfiguration') {
    throw new Error('Graph layout is only available for bar charts');
  }

  const currentGraphLayoutType =
    widgetInEditMode.configuration.graphLayoutType ?? GraphLayoutType.VERTICAL;

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const layoutOptions: GraphLayoutType[] = [
    GraphLayoutType.VERTICAL,
    GraphLayoutType.HORIZONTAL,
  ];

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const handleSelectGraphLayoutOption = (layoutOption: GraphLayoutType) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        graphLayoutType: layoutOption,
      },
    });
    closeDropdown();
  };

  return (
    <>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={layoutOptions}
        >
          {layoutOptions.map((option) => (
            <SelectableListItem
              key={option}
              itemId={option}
              onEnter={() => {
                handleSelectGraphLayoutOption(option);
              }}
            >
              <MenuItemSelect
                text={getChartGraphLayoutOptions(option)}
                selected={currentGraphLayoutType === option}
                focused={selectedItemId === option}
                onClick={() => {
                  handleSelectGraphLayoutOption(option);
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
