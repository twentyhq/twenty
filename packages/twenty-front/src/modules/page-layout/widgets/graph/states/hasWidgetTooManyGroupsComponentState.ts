import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const hasWidgetTooManyGroupsComponentState = createComponentState({
  key: 'hasWidgetTooManyGroupsComponentState',
  defaultValue: false,
  componentInstanceContext: GraphWidgetComponentInstanceContext,
});
