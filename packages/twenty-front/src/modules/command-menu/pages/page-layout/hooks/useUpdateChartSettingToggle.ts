import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { getConfigKeyFromSettingId } from '@/command-menu/pages/page-layout/utils/getConfigKeyFromSettingId';
import { BarChartGroupMode } from '~/generated/graphql';
import { useChartSettingsValues } from './useChartSettingsValues';
import { useUpdateCurrentWidgetConfig } from './useUpdateCurrentWidgetConfig';

export const useUpdateChartSettingToggle = ({
  pageLayoutId,
  objectMetadataId,
  configuration,
}: {
  pageLayoutId: string;
  objectMetadataId: string;
  configuration: ChartConfiguration;
}) => {
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { getChartSettingsValues } = useChartSettingsValues({
    objectMetadataId,
    configuration,
  });

  const updateChartSettingToggle = (
    settingId: CHART_CONFIGURATION_SETTING_IDS,
  ) => {
    const configKey = getConfigKeyFromSettingId(settingId);

    if (settingId === CHART_CONFIGURATION_SETTING_IDS.STACKED_BARS) {
      const isCurrentlyStacked = getChartSettingsValues(settingId);
      const newGroupMode = isCurrentlyStacked
        ? BarChartGroupMode.GROUPED
        : BarChartGroupMode.STACKED;

      updateCurrentWidgetConfig({
        configToUpdate: {
          groupMode: newGroupMode,
        },
      });
      return;
    }

    if (settingId === CHART_CONFIGURATION_SETTING_IDS.STACKED_LINES) {
      const isCurrentlyStacked = getChartSettingsValues(settingId);

      updateCurrentWidgetConfig({
        configToUpdate: {
          isStacked: !isCurrentlyStacked,
        },
      });
      return;
    }

    const newValue = !getChartSettingsValues(settingId);

    updateCurrentWidgetConfig({
      configToUpdate: {
        [configKey]: newValue,
      },
    });
  };

  return { updateChartSettingToggle };
};
