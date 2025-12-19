import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const fieldWidgetHoverComponentState = createComponentState<boolean>({
  key: 'fieldWidgetHoverComponentState',
  defaultValue: false,
  componentInstanceContext: WidgetComponentInstanceContext,
});
