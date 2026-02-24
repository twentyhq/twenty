import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const fieldWidgetHoverComponentState = createComponentStateV2<boolean>({
  key: 'fieldWidgetHoverComponentState',
  defaultValue: false,
  componentInstanceContext: WidgetComponentInstanceContext,
});
