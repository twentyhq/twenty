import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const graphWidgetHighlightedLegendIdComponentState =
  createAtomComponentState<string | null>({
    key: 'graphWidgetHighlightedLegendIdComponentState',
    defaultValue: null,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
