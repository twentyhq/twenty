import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewSort } from '../types/ViewSort';

export const unsavedToUpsertViewSortsComponentFamilyState =
  createComponentFamilyStateV2<ViewSort[], { viewId?: string }>({
    key: 'unsavedToUpsertViewSortsComponentFamilyState',
    defaultValue: [],
    componentInstanceContext: ViewComponentInstanceContext,
  });
