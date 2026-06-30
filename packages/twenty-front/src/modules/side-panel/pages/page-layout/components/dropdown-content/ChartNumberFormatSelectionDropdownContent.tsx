import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { getChartNumberFormatLabel } from '@/side-panel/pages/page-layout/utils/getChartNumberFormatLabel';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { ChartNumberFormat } from '~/generated-metadata/graphql';

export const ChartNumberFormatSelectionDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const configuration = widgetInEditMode?.configuration;

  if (
    !isWidgetConfigurationOfType(configuration, 'AggregateChartConfiguration')
  ) {
    throw new Error('Invalid configuration type');
  }

  const currentNumberFormat = configuration.numberFormat;

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const numberFormatOptions: ChartNumberFormat[] = [
    ChartNumberFormat.SHORT,
    ChartNumberFormat.FULL,
  ];

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const handleSelectNumberFormatOption = (
    numberFormatOption: ChartNumberFormat,
  ) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        numberFormat: numberFormatOption,
      },
    });
    closeDropdown();
  };

  return (
    <DropdownMenuItemsContainer>
      <SelectableList
        selectableListInstanceId={dropdownId}
        focusId={dropdownId}
        selectableItemIdArray={numberFormatOptions}
      >
        {numberFormatOptions.map((option) => (
          <SelectableListItem
            key={option}
            itemId={option}
            onEnter={() => {
              handleSelectNumberFormatOption(option);
            }}
          >
            <MenuItemSelect
              text={getChartNumberFormatLabel(option)}
              selected={currentNumberFormat === option}
              focused={selectedItemId === option}
              onClick={() => {
                handleSelectNumberFormatOption(option);
              }}
            />
          </SelectableListItem>
        ))}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
