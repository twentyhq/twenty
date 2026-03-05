import { type CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { getConfigKeyFromSettingId } from '@/side-panel/pages/page-layout/utils/getConfigKeyFromSettingId';
import { useUpdateCurrentWidgetConfig } from './useUpdateCurrentWidgetConfig';

export const useUpdateChartSettingTextInput = (pageLayoutId: string) => {
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const updateChartSettingTextInput = (
    settingId: CHART_CONFIGURATION_SETTING_IDS,
    value: string,
  ) => {
    const configKey = getConfigKeyFromSettingId(settingId);

    updateCurrentWidgetConfig({
      configToUpdate: {
        [configKey]: value,
      },
    });
  };

  return { updateChartSettingTextInput };
};
