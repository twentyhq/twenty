import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { ChartSettings } from '@/command-menu/pages/page-layout/components/ChartSettings';
import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuPageLayoutGraphTypeSelect = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const draftPageLayout = useRecoilComponentValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetId = useRecoilComponentValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const widgetInEditMode = draftPageLayout.tabs
    .flatMap((tab) => tab.widgets)
    .find((widget) => widget.id === pageLayoutEditingWidgetId);

  const theme = useTheme();

  if (
    !isDefined(widgetInEditMode?.configuration) ||
    !('graphType' in widgetInEditMode.configuration)
  ) {
    return null;
  }

  const currentGraphType = widgetInEditMode.configuration.graphType;

  return (
    <>
      <SidePanelHeader
        Icon={GRAPH_TYPE_INFORMATION[currentGraphType].icon}
        iconColor={theme.font.color.tertiary}
        initialTitle={t`Chart`}
        headerType={t(GRAPH_TYPE_INFORMATION[currentGraphType].label)}
        onTitleChange={() => {}}
      />

      <ChartSettings widget={widgetInEditMode} />
    </>
  );
};
