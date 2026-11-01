import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { t } from '@lingui/core/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { getDateGranularityLabel } from '@/side-panel/pages/page-layout/utils/getDateGranularityLabel';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  type FieldsConfiguration,
  type WidgetConfiguration,
} from '~/generated-metadata/graphql';

type ChartDateGranularitySelectionDropdownContentProps = {
  axis?: 'primary' | 'secondary';
};

const getCurrentDateGranularity = ({
  configuration,
  axis,
}: {
  configuration: ChartConfiguration;
  axis?: 'primary' | 'secondary';
}) => {
  const defaultGranularity = ObjectRecordGroupByDateGranularity.DAY;

  if (isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')) {
    return configuration.dateGranularity || defaultGranularity;
  }

  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

  if (!isBarOrLineChart) {
    return defaultGranularity;
  }

  if (axis === 'primary') {
    return configuration.primaryAxisDateGranularity || defaultGranularity;
  }

  return (
    configuration.secondaryAxisGroupByDateGranularity || defaultGranularity
  );
};

const isChartConfiguration = (
  configuration:
    | WidgetConfiguration
    | FieldsConfiguration
    | FieldConfiguration
    | null
    | undefined,
): configuration is ChartConfiguration => {
  return (
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'PieChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'AggregateChartConfiguration')
  );
};

export const ChartDateGranularitySelectionDropdownContent = ({
  axis,
}: ChartDateGranularitySelectionDropdownContentProps) => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const configuration = widgetInEditMode?.configuration;

  if (!isChartConfiguration(configuration)) {
    throw new Error(doNotTranslate('Invalid configuration type'));
  }

  const isPieChart = isWidgetConfigurationOfType(
    configuration,
    'PieChartConfiguration',
  );
  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

  if (!isDefined(axis) && !isPieChart) {
    throw new Error(doNotTranslate('Invalid configuration type'));
  }

  if (isDefined(axis) && !isBarOrLineChart) {
    throw new Error(doNotTranslate('Invalid configuration type'));
  }

  const currentDateGranularity = getCurrentDateGranularity({
    configuration,
    axis,
  });

  const dateGranularityOptions: ObjectRecordGroupByDateGranularity[] = [
    ObjectRecordGroupByDateGranularity.DAY,
    ObjectRecordGroupByDateGranularity.WEEK,
    ObjectRecordGroupByDateGranularity.MONTH,
    ObjectRecordGroupByDateGranularity.QUARTER,
    ObjectRecordGroupByDateGranularity.YEAR,
    ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
    ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
    ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
  ];

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const handleSelectDateGranularityOption = (
    dateGranularityOption: ObjectRecordGroupByDateGranularity,
  ) => {
    if (!isDefined(axis)) {
      updateCurrentWidgetConfig({
        configToUpdate: { dateGranularity: dateGranularityOption },
      });
      return;
    }

    const configToUpdate =
      axis === 'primary'
        ? { primaryAxisDateGranularity: dateGranularityOption }
        : { secondaryAxisGroupByDateGranularity: dateGranularityOption };

    updateCurrentWidgetConfig({ configToUpdate });
  };

  return (
    <ChartSettingsDropdownSection>
      <Dropdown.SelectionGroup
        aria-label={t`Date granularity`}
        value={currentDateGranularity}
      >
        {dateGranularityOptions.map((option) => (
          <Dropdown.OptionItem
            key={option}
            value={option}
            onSelect={() => handleSelectDateGranularityOption(option)}
          >
            {getDateGranularityLabel(option)}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.SelectionGroup>
    </ChartSettingsDropdownSection>
  );
};
