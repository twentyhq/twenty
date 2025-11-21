import { ChartSettings } from '@/command-menu/pages/page-layout/components/ChartSettings';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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

  if (
    !isDefined(widgetInEditMode.configuration) ||
    !('graphType' in widgetInEditMode.configuration)
  ) {
    return null;
  }

  return (
    <GraphWidgetComponentInstanceContext.Provider
      value={{ instanceId: widgetInEditMode.id }}
    >
      <ChartSettings widget={widgetInEditMode} />
    </GraphWidgetComponentInstanceContext.Provider>
  );
};
