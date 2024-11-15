import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';

export const unsavedToUpsertViewFilterGroupsComponentFamilyState =
  createComponentFamilyStateV2<ViewFilterGroup[], { viewId?: string }>({
    key: 'unsavedToUpsertViewFilterGroupsComponentFamilyState',
    defaultValue: [],
    componentInstanceContext: ViewComponentInstanceContext,
  });
