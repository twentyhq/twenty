import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const hasInitializedViewFiltersComponentFamilyState =
  createComponentFamilyStateV2<boolean, { viewId?: string }>({
    key: 'hasInitializedViewFiltersComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });
