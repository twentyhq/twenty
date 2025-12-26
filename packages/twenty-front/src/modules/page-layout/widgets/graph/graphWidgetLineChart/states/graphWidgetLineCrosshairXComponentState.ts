import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const graphWidgetLineCrosshairXComponentState = createComponentState<
  number | null
>({
  key: 'graphWidgetLineCrosshairXComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
