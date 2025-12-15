import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const graphWidgetHighlightedLegendIdComponentState =
  createComponentState<string | null>({
    key: 'graphWidgetHighlightedLegendIdComponentState',
    defaultValue: null,
    componentInstanceContext: GraphWidgetComponentInstanceContext,
  });
