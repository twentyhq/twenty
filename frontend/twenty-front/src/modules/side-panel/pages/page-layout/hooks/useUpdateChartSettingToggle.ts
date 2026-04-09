import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { getConfigKeyFromSettingId } from '@/side-panel/pages/page-layout/utils/getConfigKeyFromSettingId';
import { BarChartGroupMode } from '~/generated-metadata/graphql';
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
      const newGroupMode = Boolean(isCurrentlyStacked)
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
          isStacked: !Boolean(isCurrentlyStacked),
        },
      });
      return;
    }

    const newValue = !Boolean(getChartSettingsValues(settingId));

    updateCurrentWidgetConfig({
      configToUpdate: {
        [configKey]: newValue,
      },
    });
  };

  return { updateChartSettingToggle };
};
