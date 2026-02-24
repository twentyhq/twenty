import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const graphWidgetLineCrosshairXComponentState = createComponentStateV2<
  number | null
>({
  key: 'graphWidgetLineCrosshairXComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
