import { TitleInputComponentInstanceContext } from '@/ui/input/states/contexts/TitleInputComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const titleInputIsOpenedComponentState = createComponentStateV2<boolean>(
  {
    key: 'titleInputIsOpenedComponentState',
    defaultValue: false,
    componentInstanceContext: TitleInputComponentInstanceContext,
  },
);
