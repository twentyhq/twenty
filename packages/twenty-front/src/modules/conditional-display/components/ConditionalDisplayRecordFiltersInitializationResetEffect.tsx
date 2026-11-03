import { useEffect } from 'react';

import { hasInitializedRecordFiltersComponentState } from '@/object-record/record-filter/states/hasInitializedRecordFiltersComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

type ConditionalDisplayRecordFiltersInitializationResetEffectProps = {
  instanceId: string;
};

export const ConditionalDisplayRecordFiltersInitializationResetEffect = ({
  instanceId,
}: ConditionalDisplayRecordFiltersInitializationResetEffectProps) => {
  const setHasInitializedRecordFilters = useSetAtomComponentState(
    hasInitializedRecordFiltersComponentState,
    instanceId,
  );

  useEffect(
    () => () => setHasInitializedRecordFilters(false),
    [setHasInitializedRecordFilters],
  );

  return null;
};
