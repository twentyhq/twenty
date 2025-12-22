import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const hasWidgetTooManyGroupsComponentState = createComponentState({
  key: 'hasWidgetTooManyGroupsComponentState',
  defaultValue: false,
  componentInstanceContext: WidgetComponentInstanceContext,
});
