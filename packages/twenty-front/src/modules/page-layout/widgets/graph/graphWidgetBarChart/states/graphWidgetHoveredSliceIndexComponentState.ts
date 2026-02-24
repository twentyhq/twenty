import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const graphWidgetHoveredSliceIndexComponentState =
  createComponentStateV2<string | null>({
    key: 'graphWidgetHoveredSliceIndexComponentState',
    defaultValue: null,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
