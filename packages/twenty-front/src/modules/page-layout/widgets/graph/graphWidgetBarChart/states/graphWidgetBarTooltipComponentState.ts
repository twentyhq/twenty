import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';

export const graphWidgetBarTooltipComponentState = createComponentState<{
  datum: ComputedDatum<BarDatum>;
  anchorElement: Element;
} | null>({
  key: 'graphWidgetBarTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
