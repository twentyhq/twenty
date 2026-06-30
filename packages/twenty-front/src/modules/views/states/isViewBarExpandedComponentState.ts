import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const isViewBarExpandedComponentState =
  createAtomComponentState<boolean>({
    key: 'isViewBarExpandedComponentState',
    defaultValue: true,
    componentInstanceContext: ViewComponentInstanceContext,
  });
