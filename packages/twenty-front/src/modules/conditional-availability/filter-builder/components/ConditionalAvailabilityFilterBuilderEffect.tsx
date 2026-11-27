import { currentConditionalAvailabilityFilterGroupComponentState } from '@/conditional-availability/filter-builder/states/currentConditionalAvailabilityFilterGroupComponentState';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect, useState } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type ConditionalAvailabilityFilterBuilderEffectProps = {
  defaultValue: ConditionalAvailabilityFilterGroup;
};

export const ConditionalAvailabilityFilterBuilderEffect = ({
  defaultValue,
}: ConditionalAvailabilityFilterBuilderEffectProps) => {
  const setCurrentConditionalAvailabilityFilterGroup = useSetAtomComponentState(
    currentConditionalAvailabilityFilterGroupComponentState,
  );
  const [lastSyncedFilterGroup, setLastSyncedFilterGroup] = useState<
    ConditionalAvailabilityFilterGroup | undefined
  >(undefined);

  useEffect(() => {
    if (isDeeplyEqual(lastSyncedFilterGroup, defaultValue)) {
      return;
    }

    setLastSyncedFilterGroup(defaultValue);
    setCurrentConditionalAvailabilityFilterGroup(defaultValue);
  }, [
    defaultValue,
    lastSyncedFilterGroup,
    setCurrentConditionalAvailabilityFilterGroup,
  ]);

  return null;
};
