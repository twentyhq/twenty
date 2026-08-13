import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetHeaderInfoComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderInfoComponentFamilyState';
import { type WidgetHeaderInfo } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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
  const store = useStore();

  useEffect(() => {
    if (!isDefined(pageLayoutInstanceId) || !isDefined(widgetInstanceId)) {
      return;
    }

    const widgetHeaderInfoAtom =
      widgetHeaderInfoComponentFamilyState.atomFamily({
        instanceId: pageLayoutInstanceId,
        familyKey: widgetInstanceId,
      });

    const nextWidgetHeaderInfo = { count, actions };

    if (
      !isDeeplyEqual(store.get(widgetHeaderInfoAtom), nextWidgetHeaderInfo, {
        strict: true,
      })
    ) {
      store.set(widgetHeaderInfoAtom, nextWidgetHeaderInfo);
    }
  }, [count, actions, pageLayoutInstanceId, store, widgetInstanceId]);

  useEffect(() => {
    if (!isDefined(pageLayoutInstanceId) || !isDefined(widgetInstanceId)) {
      return;
    }

    const widgetHeaderInfoAtom =
      widgetHeaderInfoComponentFamilyState.atomFamily({
        instanceId: pageLayoutInstanceId,
        familyKey: widgetInstanceId,
      });

    return () => {
      store.set(widgetHeaderInfoAtom, null);
    };
  }, [pageLayoutInstanceId, store, widgetInstanceId]);

  return null;
};
