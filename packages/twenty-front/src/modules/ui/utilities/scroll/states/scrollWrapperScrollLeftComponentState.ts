import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const scrollWrapperScrollLeftComponentState =
  createComponentState<number>({
    key: 'scrollWrapperScrollLeftComponentState',
    defaultValue: 0,
    componentInstanceContext: ScrollWrapperComponentInstanceContext,
  });
