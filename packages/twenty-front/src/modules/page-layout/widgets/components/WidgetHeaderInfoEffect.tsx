import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetHeaderInfoComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderInfoComponentFamilyState';
import { type WidgetHeaderInfo } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type WidgetHeaderInfoPublisherEffectProps = WidgetHeaderInfo & {
  pageLayoutInstanceId: string;
  widgetInstanceId: string;
};

const WidgetHeaderInfoPublisherEffect = ({
  count,
  actions,
  pageLayoutInstanceId,
  widgetInstanceId,
}: WidgetHeaderInfoPublisherEffectProps) => {
  const setWidgetHeaderInfo = useSetAtomComponentFamilyState(
    widgetHeaderInfoComponentFamilyState,
    widgetInstanceId,
    pageLayoutInstanceId,
  );

  useEffect(() => {
    const nextWidgetHeaderInfo: WidgetHeaderInfo = { count, actions };

    setWidgetHeaderInfo((currentWidgetHeaderInfo) =>
      isDeeplyEqual(currentWidgetHeaderInfo, nextWidgetHeaderInfo, {
        strict: true,
      })
        ? currentWidgetHeaderInfo
        : nextWidgetHeaderInfo,
    );
  }, [actions, count, setWidgetHeaderInfo]);

  useEffect(() => {
    return () => {
      setWidgetHeaderInfo(null);
    };
  }, [setWidgetHeaderInfo]);

  return null;
};

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

  if (isDefined(pageLayoutInstanceId) && isDefined(widgetInstanceId)) {
    return (
      <WidgetHeaderInfoPublisherEffect
        count={count}
        actions={actions}
        pageLayoutInstanceId={pageLayoutInstanceId}
        widgetInstanceId={widgetInstanceId}
      />
    );
  }

  return null;
};
