import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const graphWidgetLineCrosshairXComponentState = createComponentState<
  number | null
>({
  key: 'graphWidgetLineCrosshairXComponentState',
  defaultValue: null,
  componentInstanceContext: GraphWidgetComponentInstanceContext,
});
