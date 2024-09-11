import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewSort } from '../types/ViewSort';

export const unsavedToUpsertViewSortsComponentState = createComponentStateV2<
  ViewSort[]
>({
  key: 'unsavedToUpsertViewSortsComponentState',
  defaultValue: [],
  componentInstanceContext: ViewComponentInstanceContext,
});
