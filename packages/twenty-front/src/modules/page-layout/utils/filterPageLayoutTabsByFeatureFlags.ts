import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { WidgetType } from '~/generated-metadata/graphql';

const NATIVE_CALL_RECORDING_WIDGET_TYPES = new Set<WidgetType>([
  WidgetType.CALL_RECORDING_SUMMARY,
  WidgetType.CALL_RECORDING_TRANSCRIPT,
]);

type FilterPageLayoutTabsByFeatureFlagsParams = {
  tabs: PageLayoutTab[];
  isNativeCallRecordingTabsEnabled: boolean;
};

export const filterPageLayoutTabsByFeatureFlags = ({
  tabs,
  isNativeCallRecordingTabsEnabled,
}: FilterPageLayoutTabsByFeatureFlagsParams): PageLayoutTab[] => {
  if (isNativeCallRecordingTabsEnabled) {
    return tabs;
  }

  return tabs.flatMap((tab) => {
    const featureEnabledWidgets = tab.widgets.filter(
      (widget) => !NATIVE_CALL_RECORDING_WIDGET_TYPES.has(widget.type),
    );

    if (featureEnabledWidgets.length === tab.widgets.length) {
      return [tab];
    }

    if (featureEnabledWidgets.length === 0) {
      return [];
    }

    return [{ ...tab, widgets: featureEnabledWidgets }];
  });
};
