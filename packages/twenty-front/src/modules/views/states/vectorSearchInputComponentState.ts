import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const vectorSearchInputComponentState = createComponentStateV2<string>({
  key: 'vectorSearchInputComponentState',
  defaultValue: '',
  componentInstanceContext: ViewComponentInstanceContext,
});
