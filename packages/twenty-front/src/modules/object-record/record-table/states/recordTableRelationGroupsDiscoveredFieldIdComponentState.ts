import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordTableRelationGroupsDiscoveredFieldIdComponentState =
  createAtomComponentState<string | null>({
    key: 'recordTableRelationGroupsDiscoveredFieldIdComponentState',
    componentInstanceContext: ViewComponentInstanceContext,
    defaultValue: null,
  });
