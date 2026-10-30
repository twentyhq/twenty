import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { t } from '@lingui/core/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { CHART_NUMBER_FORMAT_DEFAULT } from '@/page-layout/widgets/graph/constants/ChartNumberFormatDefault';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { getChartNumberFormatLabel } from '@/side-panel/pages/page-layout/utils/getChartNumberFormatLabel';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { ChartNumberFormat } from '~/generated-metadata/graphql';
import { doNotTranslate } from 'twenty-shared/i18n';

export const ChartNumberFormatSelectionDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const configuration = widgetInEditMode?.configuration;

  const isChartWithNumberFormat =
    isWidgetConfigurationOfType(configuration, 'AggregateChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'PieChartConfiguration');

  if (!isChartWithNumberFormat) {
    throw new Error(doNotTranslate('Invalid configuration type'));
  }

  const currentNumberFormat =
    configuration.numberFormat ??
    (configuration.__typename === 'AggregateChartConfiguration'
      ? undefined
      : CHART_NUMBER_FORMAT_DEFAULT);

  const numberFormatOptions: ChartNumberFormat[] = [
    ChartNumberFormat.SHORT,
    ChartNumberFormat.FULL,
  ];

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const handleSelectNumberFormatOption = (
    numberFormatOption: ChartNumberFormat,
  ) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        numberFormat: numberFormatOption,
      },
    });
  };

  return (
    <ChartSettingsDropdownSection>
      <Dropdown.SelectionGroup
        aria-label={t`Number format`}
        value={currentNumberFormat ?? null}
      >
        {numberFormatOptions.map((option) => (
          <Dropdown.OptionItem
            key={option}
            value={option}
            onSelect={() => handleSelectNumberFormatOption(option)}
          >
            {getChartNumberFormatLabel(option)}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.SelectionGroup>
    </ChartSettingsDropdownSection>
  );
};
