import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const isViewBarExpandedComponentState = createComponentState<boolean>({
  key: 'isViewBarExpandedComponentState',
  defaultValue: true,
  componentInstanceContext: ViewComponentInstanceContext,
});
