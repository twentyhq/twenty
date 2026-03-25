import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const scrollWrapperScrollBottomComponentState =
  createAtomComponentState<number>({
    key: 'scrollWrapperScrollBottomComponentState',
    defaultValue: 0,
    componentInstanceContext: ScrollWrapperComponentInstanceContext,
  });
