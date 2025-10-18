import { type CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { getConfigKeyFromSettingId } from '@/command-menu/pages/page-layout/utils/getConfigKeyFromSettingId';
import { useUpdateCurrentWidgetConfig } from './useUpdateCurrentWidgetConfig';

export const useUpdateChartSettingInput = (pageLayoutId: string) => {
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const updateChartSettingInput = (
    settingId: CHART_CONFIGURATION_SETTING_IDS,
    value: number | null,
  ) => {
    const configKey = getConfigKeyFromSettingId(settingId);

    updateCurrentWidgetConfig({
      configToUpdate: {
        [configKey]: value,
      },
    });
  };

  return { updateChartSettingInput };
};
