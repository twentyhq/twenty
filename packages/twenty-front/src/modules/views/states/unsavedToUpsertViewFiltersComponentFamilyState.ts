import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewFilter } from '@/views/types/ViewFilter';

export const unsavedToUpsertViewFiltersComponentFamilyState =
  createComponentFamilyStateV2<ViewFilter[], { viewId?: string }>({
    key: 'unsavedToUpsertViewFiltersComponentFamilyState',
    defaultValue: [],
    componentInstanceContext: ViewComponentInstanceContext,
  });
