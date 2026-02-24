import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const graphWidgetHiddenLegendIdsComponentState = createComponentState<
  string[]
>({
  key: 'graphWidgetHiddenLegendIdsComponentState',
  defaultValue: [],
  componentInstanceContext: WidgetComponentInstanceContext,
});
