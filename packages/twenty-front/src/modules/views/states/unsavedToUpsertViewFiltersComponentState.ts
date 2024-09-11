import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewFilter } from '../types/ViewFilter';

export const unsavedToUpsertViewFiltersComponentState = createComponentStateV2<
  ViewFilter[]
>({
  key: 'unsavedToUpsertViewFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: ViewComponentInstanceContext,
});
