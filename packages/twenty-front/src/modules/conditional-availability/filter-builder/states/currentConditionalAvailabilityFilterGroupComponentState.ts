import { ConditionalAvailabilityFilterGroupComponentInstanceContext } from '@/conditional-availability/filter-builder/states/context/ConditionalAvailabilityFilterGroupComponentInstanceContext';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const currentConditionalAvailabilityFilterGroupComponentState =
  createAtomComponentState<ConditionalAvailabilityFilterGroup | undefined>({
    key: 'currentConditionalAvailabilityFilterGroupComponentState',
    defaultValue: undefined,
    componentInstanceContext:
      ConditionalAvailabilityFilterGroupComponentInstanceContext,
  });
