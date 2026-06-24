import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordTableRelationGroupsDiscoverySettledFieldIdComponentState =
  createAtomComponentState<string | null>({
    key: 'recordTableRelationGroupsDiscoverySettledFieldIdComponentState',
    componentInstanceContext: ViewComponentInstanceContext,
    defaultValue: null,
  });
