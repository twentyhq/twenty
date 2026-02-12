import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const graphWidgetHighlightedLegendIdComponentState =
  createComponentState<string | null>({
    key: 'graphWidgetHighlightedLegendIdComponentState',
    defaultValue: null,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
