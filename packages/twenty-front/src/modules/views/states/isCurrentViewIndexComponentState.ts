import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const isCurrentViewKeyIndexComponentState =
  createComponentState<boolean>({
    key: 'isCurrentViewKeyIndexComponentState',
    defaultValue: true,
    componentInstanceContext: ViewComponentInstanceContext,
  });
