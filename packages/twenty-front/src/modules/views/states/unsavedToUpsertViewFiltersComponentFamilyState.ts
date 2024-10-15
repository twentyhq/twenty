import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewFilterDraft } from '@/views/types/ViewFilterDraft';

export const unsavedToUpsertViewFiltersComponentFamilyState =
  createComponentFamilyStateV2<ViewFilterDraft[], { viewId?: string }>({
    key: 'unsavedToUpsertViewFiltersComponentFamilyState',
    defaultValue: [],
    componentInstanceContext: ViewComponentInstanceContext,
  });
