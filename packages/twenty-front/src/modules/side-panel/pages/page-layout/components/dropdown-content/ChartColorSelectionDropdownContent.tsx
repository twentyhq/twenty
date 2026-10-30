import { ChartColorGradientOption } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartColorGradientOption';
import { ChartColorPaletteOption } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartColorPaletteOption';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { capitalize, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { Dropdown } from 'twenty-ui/components/navigation';
import { MAIN_COLOR_NAMES, type ThemeColor } from 'twenty-ui/theme';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type ColorOption = {
  id: string;
  name: string;
  colorName: ThemeColor | 'auto';
};

export const ChartColorSelectionDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  if (
    isWidgetConfigurationOfType(
      widgetInEditMode.configuration,
      'IframeConfiguration',
    )
  ) {
    throw new Error(doNotTranslate('Invalid configuration type'));
  }

  const configuration = widgetInEditMode.configuration as ChartConfiguration;

  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');
  const isPieChart = isWidgetConfigurationOfType(
    configuration,
    'PieChartConfiguration',
  );

  if (!isBarOrLineChart && !isPieChart) {
    return null;
  }

  const currentColor = configuration.color;

  const colorOptions: ColorOption[] = [
    {
      id: 'auto',
      name: t`Default palette`,
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
  };

  const regularColorOptions = filteredColorOptions.filter(
    (option): option is ColorOption & { colorName: ThemeColor } =>
      option.colorName !== 'auto',
  );
  const hasDefaultPalette = filteredColorOptions.some(
    (option) => option.colorName === 'auto',
  );

  return (
    <>
      <Dropdown.Search
        placeholder={t`Search colors`}
        aria-label={t`Search colors`}
        onValueChange={setSearchQuery}
        value={searchQuery}
      />
      <ChartSettingsDropdownSection>
        <Dropdown.SelectionGroup
          aria-label={t`Colors`}
          value={currentColor ?? 'auto'}
          onValueChange={(value) => {
            const selectedColor = colorOptions.find(
              (option) => option.id === value,
            );
            if (isDefined(selectedColor)) {
              handleSelectColor(selectedColor.colorName);
            }
          }}
        >
          {hasDefaultPalette && <ChartColorPaletteOption />}
          {hasDefaultPalette && isNonEmptyArray(regularColorOptions) && (
            <Dropdown.Separator />
          )}
          {regularColorOptions.map((colorOption) => (
            <ChartColorGradientOption
              key={colorOption.id}
              colorOption={colorOption}
            />
          ))}
        </Dropdown.SelectionGroup>
        {!isNonEmptyArray(filteredColorOptions) && (
          <Dropdown.Empty>{t`No results found`}</Dropdown.Empty>
        )}
      </ChartSettingsDropdownSection>
    </>
  );
};
