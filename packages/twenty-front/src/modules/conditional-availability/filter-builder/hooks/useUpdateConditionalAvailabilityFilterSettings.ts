import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { currentConditionalAvailabilityFilterGroupComponentState } from '@/conditional-availability/filter-builder/states/currentConditionalAvailabilityFilterGroupComponentState';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateConditionalAvailabilityFilterSettings = () => {
  const currentConditionalAvailabilityFilterGroup =
    useAtomComponentStateCallbackState(
      currentConditionalAvailabilityFilterGroupComponentState,
    );
  const { onFilterSettingsUpdate } =
    useConditionalAvailabilityFilterBuilderContextOrThrow();
  const store = useStore();

  const updateConditionalAvailabilityFilterSettings = (
    update: (
      filterGroup: ConditionalAvailabilityFilterGroup,
    ) => ConditionalAvailabilityFilterGroup,
  ) => {
    const filterGroup = store.get(currentConditionalAvailabilityFilterGroup);

    if (!isDefined(filterGroup)) {
      return;
    }

    const updatedFilterGroup = update(filterGroup);

    store.set(currentConditionalAvailabilityFilterGroup, updatedFilterGroup);
    onFilterSettingsUpdate(updatedFilterGroup);
  };

  return { updateConditionalAvailabilityFilterSettings };
};
