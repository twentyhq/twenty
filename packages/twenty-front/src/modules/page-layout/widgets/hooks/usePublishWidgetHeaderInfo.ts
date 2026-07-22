import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetHeaderInfoComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderInfoComponentFamilyState';
import { type WidgetHeaderInfo } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

const OUTSIDE_WIDGET_INSTANCE_ID = 'widget-header-info-outside-widget';

// Publish header information (grey count next to the title, primary action on
// the right) from a widget's content to the widget chrome. Safe to call from
// components that also render outside a page layout: it no-ops there. Pass
// stable references (memoized primaryAction) to avoid re-publishing on every
// render.
export const usePublishWidgetHeaderInfo = ({
  count,
  primaryAction,
}: WidgetHeaderInfo) => {
  const pageLayoutInstanceId = useAvailableComponentInstanceId(
    PageLayoutComponentInstanceContext,
  );
  const widgetInstanceId = useAvailableComponentInstanceId(
    WidgetComponentInstanceContext,
  );

  const isInsideWidget =
    isDefined(pageLayoutInstanceId) && isDefined(widgetInstanceId);

  const setWidgetHeaderInfo = useSetAtomComponentFamilyState(
    widgetHeaderInfoComponentFamilyState,
    widgetInstanceId ?? OUTSIDE_WIDGET_INSTANCE_ID,
    pageLayoutInstanceId ?? OUTSIDE_WIDGET_INSTANCE_ID,
  );

  useEffect(() => {
    if (!isInsideWidget) {
      return;
    }

    setWidgetHeaderInfo({ count, primaryAction });
  }, [count, primaryAction, isInsideWidget, setWidgetHeaderInfo]);

  useEffect(() => {
    if (!isInsideWidget) {
      return;
    }

    return () => {
      setWidgetHeaderInfo(null);
    };
  }, [isInsideWidget, setWidgetHeaderInfo]);
};
