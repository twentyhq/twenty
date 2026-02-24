import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const graphWidgetHiddenLegendIdsComponentState = createComponentStateV2<
  string[]
>({
  key: 'graphWidgetHiddenLegendIdsComponentState',
  defaultValue: [],
  componentInstanceContext: WidgetComponentInstanceContext,
});
