import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Written in the capture phase of a chart click and read when the chart reports the bucket; nothing renders from it.
export const graphWidgetChartClickPositionComponentState =
  createAtomComponentState<{ x: number; y: number } | null>({
    key: 'graphWidgetChartClickPositionComponentState',
    defaultValue: null,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
