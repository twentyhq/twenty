import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { ChartSettings } from '@/command-menu/pages/page-layout/components/ChartSettings';
import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
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

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  if (!isDefined(pageLayoutEditingWidgetId)) {
    throw new Error('Widget ID must be present while editing the widget');
  }

  const widgetInEditMode = draftPageLayout.tabs
    .flatMap((tab) => tab.widgets)
    .find((widget) => widget.id === pageLayoutEditingWidgetId);

  if (!isDefined(widgetInEditMode)) {
    throw new Error(
      `Widget with ID ${pageLayoutEditingWidgetId} not found in page layout`,
    );
  }

  const theme = useTheme();

  if (
    !isDefined(widgetInEditMode.configuration) ||
    !('graphType' in widgetInEditMode.configuration)
  ) {
    return null;
  }

  const currentGraphType = widgetInEditMode.configuration.graphType;
  const graphTypeLabel = t(GRAPH_TYPE_INFORMATION[currentGraphType].label);

  return (
    <GraphWidgetComponentInstanceContext.Provider
      value={{ instanceId: widgetInEditMode.id }}
    >
      <SidePanelHeader
        Icon={GRAPH_TYPE_INFORMATION[currentGraphType].icon}
        iconColor={theme.font.color.tertiary}
        initialTitle={widgetInEditMode.title}
        headerType={t`${graphTypeLabel} Chart`}
        onTitleChange={(newTitle) => {
          if (isNonEmptyString(newTitle)) {
            updatePageLayoutWidget(widgetInEditMode.id, {
              title: newTitle,
            });
          }
        }}
      />
      <ChartSettings widget={widgetInEditMode} />
    </GraphWidgetComponentInstanceContext.Provider>
  );
};
