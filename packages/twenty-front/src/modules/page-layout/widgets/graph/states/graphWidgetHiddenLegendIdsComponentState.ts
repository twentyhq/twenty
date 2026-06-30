import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const graphWidgetHiddenLegendIdsComponentState =
  createAtomComponentState<string[]>({
    key: 'graphWidgetHiddenLegendIdsComponentState',
    defaultValue: [],
    componentInstanceContext: WidgetComponentInstanceContext,
  });
