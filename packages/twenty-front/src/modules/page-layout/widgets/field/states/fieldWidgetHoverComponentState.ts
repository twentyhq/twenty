import { FieldWidgetComponentInstanceContext } from '@/page-layout/widgets/field/states/contexts/FieldWidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const fieldWidgetHoverComponentState = createComponentState<boolean>({
  key: 'fieldWidgetHoverComponentState',
  defaultValue: false,
  componentInstanceContext: FieldWidgetComponentInstanceContext,
});
