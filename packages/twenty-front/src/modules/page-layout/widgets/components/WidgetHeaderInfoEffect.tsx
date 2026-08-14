import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetHeaderInfoComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderInfoComponentFamilyState';
import { type WidgetHeaderInfo } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const OUTSIDE_WIDGET_INSTANCE_ID = 'widget-header-info-outside-widget';

type WidgetHeaderInfoEffectProps = WidgetHeaderInfo;

export const WidgetHeaderInfoEffect = ({
  count,
  actions,
}: WidgetHeaderInfoEffectProps) => {
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

    const nextWidgetHeaderInfo: WidgetHeaderInfo = { count, actions };

    setWidgetHeaderInfo((currentWidgetHeaderInfo) =>
      isDeeplyEqual(currentWidgetHeaderInfo, nextWidgetHeaderInfo, {
        strict: true,
      })
        ? currentWidgetHeaderInfo
        : nextWidgetHeaderInfo,
    );
  }, [actions, count, isInsideWidget, setWidgetHeaderInfo]);

  useEffect(() => {
    if (!isInsideWidget) {
      return;
    }

    return () => {
      setWidgetHeaderInfo(null);
    };
  }, [isInsideWidget, setWidgetHeaderInfo]);

  return null;
};
