import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { t } from '@lingui/core/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { getChartAxisNameDisplayOptions } from '@/side-panel/pages/page-layout/utils/getChartAxisNameDisplayOptions';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { AxisNameDisplay } from '~/generated-metadata/graphql';
import { doNotTranslate } from 'twenty-shared/i18n';

export const ChartAxisNameSelectionDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const configuration = widgetInEditMode?.configuration;

  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

  if (!isBarOrLineChart) {
    throw new Error(doNotTranslate('Invalid configuration type'));
  }

  const currentAxisNameDisplay = configuration.axisNameDisplay;

  const axisOptions: AxisNameDisplay[] = [
    AxisNameDisplay.NONE,
    AxisNameDisplay.X,
    AxisNameDisplay.Y,
    AxisNameDisplay.BOTH,
  ];

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const handleSelectAxisNameOption = (axisNameOption: AxisNameDisplay) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        axisNameDisplay: axisNameOption,
      },
    });
  };

  return (
    <ChartSettingsDropdownSection>
      <Dropdown.SelectionGroup
        aria-label={t`Axis name`}
        value={currentAxisNameDisplay?.toUpperCase() ?? null}
      >
        {axisOptions.map((option) => (
          <Dropdown.OptionItem
            key={option}
            value={option}
            onSelect={() => handleSelectAxisNameOption(option)}
          >
            {getChartAxisNameDisplayOptions(option)}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.SelectionGroup>
    </ChartSettingsDropdownSection>
  );
};
