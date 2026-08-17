import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { isDefined } from 'twenty-shared/utils';

export const useCurrentWidgetOrNull = (): PageLayoutWidget | null => {
  const widgetComponentInstanceId = useComponentInstanceStateContext(
    WidgetComponentInstanceContext,
  );

  const { currentPageLayout } = useCurrentPageLayout();

  if (!isDefined(widgetComponentInstanceId)) {
    return null;
  }

  return (
    currentPageLayout?.tabs
      ?.flatMap((tab) => tab.widgets)
      .find(
        (widget) => widget.id === widgetComponentInstanceId.instanceId,
      ) ?? null
  );
};
