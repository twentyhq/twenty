import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { WidgetComponentInstanceContext } from '../states/contexts/WidgetComponentInstanceContext';

export const useCurrentWidget = (): PageLayoutWidget => {
  const widgetComponentInstanceId = useComponentInstanceStateContext(
    WidgetComponentInstanceContext,
  );

  assertIsDefinedOrThrow(widgetComponentInstanceId);

  const { currentPageLayout } = useCurrentPageLayout();

  const widget = currentPageLayout?.tabs
    ?.flatMap((tab) => tab.widgets)
    .find((widget) => widget.id === widgetComponentInstanceId.instanceId);

  assertIsDefinedOrThrow(widget);

  return widget;
};
