import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const graphWidgetHoveredSliceIndexComponentState =
  createAtomComponentState<string | null>({
    key: 'graphWidgetHoveredSliceIndexComponentState',
    defaultValue: null,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
