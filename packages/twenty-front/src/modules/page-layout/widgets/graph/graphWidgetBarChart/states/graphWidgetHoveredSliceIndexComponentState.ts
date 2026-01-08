import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const graphWidgetHoveredSliceIndexComponentState = createComponentState<
  string | null
>({
  key: 'graphWidgetHoveredSliceIndexComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
