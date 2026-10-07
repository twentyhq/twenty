import { type GraphWidgetChartBucketMenuState } from '@/page-layout/widgets/graph/types/GraphWidgetChartBucketMenuState';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const graphWidgetChartBucketMenuComponentState =
  createAtomComponentState<GraphWidgetChartBucketMenuState | null>({
    key: 'graphWidgetChartBucketMenuComponentState',
    defaultValue: null,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
