import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const unsavedToDeleteViewSortIdsComponentFamilyState =
  createComponentFamilyStateV2<string[], { viewId?: string }>({
    key: 'unsavedToDeleteViewSortIdsComponentFamilyState',
    defaultValue: [],
    componentInstanceContext: ViewComponentInstanceContext,
  });
