import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const lastActiveRecordGroupTabIdComponentState =
  createAtomComponentState<string | null>({
    key: 'lastActiveRecordGroupTabIdComponentState',
    defaultValue: null,
    componentInstanceContext: ViewComponentInstanceContext,
  });
