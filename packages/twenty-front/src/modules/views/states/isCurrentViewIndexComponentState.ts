import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const isCurrentViewKeyIndexComponentState =
  createComponentStateV2<boolean>({
    key: 'isCurrentViewKeyIndexComponentState',
    defaultValue: true,
    componentInstanceContext: ViewComponentInstanceContext,
  });
