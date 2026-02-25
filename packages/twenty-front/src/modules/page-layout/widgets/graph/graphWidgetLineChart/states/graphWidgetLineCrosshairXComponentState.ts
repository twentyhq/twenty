import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const graphWidgetLineCrosshairXComponentState = createAtomComponentState<
  number | null
>({
  key: 'graphWidgetLineCrosshairXComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
