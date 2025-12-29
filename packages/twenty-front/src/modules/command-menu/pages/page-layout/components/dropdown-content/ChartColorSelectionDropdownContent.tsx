import { ChartColorGradientOption } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartColorGradientOption';
import { ChartColorPaletteOption } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartColorPaletteOption';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { MAIN_COLOR_NAMES, type ThemeColor } from 'twenty-ui/theme';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type ColorOption = {
  id: string;
  name: string;
  colorName: ThemeColor | 'auto';
};

export const ChartColorSelectionDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  if (
    isWidgetConfigurationOfType(
      widgetInEditMode.configuration,
      'IframeConfiguration',
    )
  ) {
    throw new Error('Invalid configuration type');
  }

  const configuration = widgetInEditMode.configuration as ChartConfiguration;

  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');
  const isGaugeChart = isWidgetConfigurationOfType(
    configuration,
    'GaugeChartConfiguration',
  );
  const isPieChart = isWidgetConfigurationOfType(
    configuration,
    'PieChartConfiguration',
  );

  if (!isBarOrLineChart && !isGaugeChart && !isPieChart) {
    return null;
  }

  const currentColor = configuration.color;

  const colorOptions: ColorOption[] = [
    {
      id: 'auto',
      name: 'Default palette',
      colorName: 'auto',
    },
    ...MAIN_COLOR_NAMES.map((colorName) => ({
      id: colorName,
      name: capitalize(colorName),
      colorName: colorName,
    })),
  ];

  const filteredColorOptions = filterBySearchQuery({
    items: colorOptions,
    searchQuery,
    getSearchableValues: (item) => [item.name],
  });

  const handleSelectColor = (colorName: ThemeColor | 'auto') => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        color: colorName,
      },
    });
    closeDropdown();
  };

  const regularColorOptions = filteredColorOptions.filter(
    (option) => option.colorName !== 'auto',
  );

  return (
    <>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search colors`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={filteredColorOptions.map(
            (colorOption) => colorOption.id,
          )}
        >
          <ChartColorPaletteOption
            selectedItemId={selectedItemId}
            currentColor={currentColor}
            onSelectColor={handleSelectColor}
          />

          {regularColorOptions.length > 0 && (
            <>
              <DropdownMenuSeparator />

              {regularColorOptions.map((colorOption) => (
                <ChartColorGradientOption
                  key={colorOption.id}
                  colorOption={colorOption}
                  selectedItemId={selectedItemId}
                  currentColor={currentColor}
                  onSelectColor={handleSelectColor}
                />
              ))}
            </>
          )}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
