import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const scrollWrapperScrollBottomComponentState =
  createComponentState<number>({
    key: 'scrollWrapperScrollBottomComponentState',
    defaultValue: 0,
    componentInstanceContext: ScrollWrapperComponentInstanceContext,
  });
