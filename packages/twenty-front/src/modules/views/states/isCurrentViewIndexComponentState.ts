import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const isCurrentViewKeyIndexComponentState =
  createAtomComponentState<boolean>({
    key: 'isCurrentViewKeyIndexComponentState',
    defaultValue: true,
    componentInstanceContext: ViewComponentInstanceContext,
  });
