import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const graphWidgetHighlightedLegendIdComponentState =
  createComponentStateV2<string | null>({
    key: 'graphWidgetHighlightedLegendIdComponentState',
    defaultValue: null,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
