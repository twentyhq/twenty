import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const scrollWrapperIsScrollableComponentState =
  createComponentStateV2<boolean>({
    key: 'scrollWrapperIsScrollableComponentState',
    defaultValue: false,
    componentInstanceContext: ScrollWrapperComponentInstanceContext,
  });
