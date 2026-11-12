import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const selectedRecordIndexTabIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'selectedRecordIndexTabIdComponentState',
  defaultValue: null,
  componentInstanceContext: ViewComponentInstanceContext,
});
