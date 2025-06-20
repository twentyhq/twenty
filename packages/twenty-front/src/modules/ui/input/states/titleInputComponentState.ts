import { TitleInputComponentInstanceContext } from '@/ui/input/contexts/titleInputComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const titleInputComponentState = createComponentStateV2<boolean>({
  key: 'titleInputComponentState',
  defaultValue: false,
  componentInstanceContext: TitleInputComponentInstanceContext,
});
