import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { getConfigKeyFromSettingId } from '@/command-menu/pages/page-layout/utils/getConfigKeyFromSettingId';
import { BarChartGroupMode, type PageLayoutWidget } from '~/generated/graphql';
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

    const newValue = !getChartSettingsValues(settingId);
    const baseConfigUpdate: Partial<PageLayoutWidget['configuration']> = {
      [configKey]: newValue,
    };

    const configToUpdate =
      settingId === CHART_CONFIGURATION_SETTING_IDS.GROUP_BY &&
      !newValue &&
      configuration.__typename === 'BarChartConfiguration'
        ? { ...baseConfigUpdate, groupMode: undefined }
        : baseConfigUpdate;

    updateCurrentWidgetConfig({
      configToUpdate,
    });
  };

  return { updateChartSettingToggle };
};
