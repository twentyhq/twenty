import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const selectedRecordGroupTabIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'selectedRecordGroupTabIdComponentState',
  defaultValue: null,
  componentInstanceContext: ViewComponentInstanceContext,
});
