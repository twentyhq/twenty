import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { OverlayScrollbars } from 'overlayscrollbars';

export const scrollWrapperInstanceComponentState =
  createComponentStateV2<OverlayScrollbars | null>({
    key: 'scrollWrapperInstanceComponentState',
    defaultValue: null,
    componentInstanceContext: ScrollWrapperComponentInstanceContext,
  });
