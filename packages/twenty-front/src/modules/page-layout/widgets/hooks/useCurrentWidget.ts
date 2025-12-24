import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';

export const useCurrentWidget = (): PageLayoutWidget => {
  const widgetComponentInstanceId = useComponentInstanceStateContext(
    WidgetComponentInstanceContext,
  );

  assertIsDefinedOrThrow(
    widgetComponentInstanceId,
    new Error('Widget Component Instance ID is not defined'),
  );

  const { currentPageLayout } = useCurrentPageLayout();

  const widget = currentPageLayout?.tabs
    ?.flatMap((tab) => tab.widgets)
    .find((widget) => widget.id === widgetComponentInstanceId.instanceId);

  assertIsDefinedOrThrow(widget, new Error('Current widget is not defined'));

  return widget;
};
