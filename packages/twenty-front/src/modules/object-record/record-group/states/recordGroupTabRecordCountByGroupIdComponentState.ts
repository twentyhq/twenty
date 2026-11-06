import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordGroupTabRecordCountByGroupIdComponentState =
  createAtomComponentState<Record<string, number> | null>({
    key: 'recordGroupTabRecordCountByGroupIdComponentState',
    defaultValue: null,
    componentInstanceContext: ViewComponentInstanceContext,
  });
