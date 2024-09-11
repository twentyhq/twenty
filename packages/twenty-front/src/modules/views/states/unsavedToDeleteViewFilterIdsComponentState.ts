import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const unsavedToDeleteViewFilterIdsComponentState =
  createComponentStateV2<string[]>({
    key: 'unsavedToDeleteViewFilterIdsComponentState',
    defaultValue: [],
    componentInstanceContext: ViewComponentInstanceContext,
  });
