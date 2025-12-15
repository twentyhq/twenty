import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const graphWidgetHiddenLegendIdsComponentState = createComponentState<
  string[]
>({
  key: 'graphWidgetHiddenLegendIdsComponentState',
  defaultValue: [],
  componentInstanceContext: GraphWidgetComponentInstanceContext,
});
