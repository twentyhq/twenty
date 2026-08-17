import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetHeaderCountSyncEffect } from '@/page-layout/widgets/components/WidgetHeaderCountSyncEffect';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { isDefined } from 'twenty-shared/utils';

type WidgetHeaderCountEffectProps = {
  count?: number;
};

export const WidgetHeaderCountEffect = ({
  count,
}: WidgetHeaderCountEffectProps) => {
  const pageLayoutInstanceId = useAvailableComponentInstanceId(
    PageLayoutComponentInstanceContext,
  );
  const widgetInstanceId = useAvailableComponentInstanceId(
    WidgetComponentInstanceContext,
  );

  if (isDefined(pageLayoutInstanceId) && isDefined(widgetInstanceId)) {
    return (
      <WidgetHeaderCountSyncEffect
        count={count}
        pageLayoutInstanceId={pageLayoutInstanceId}
        widgetInstanceId={widgetInstanceId}
      />
    );
  }

  return null;
};
