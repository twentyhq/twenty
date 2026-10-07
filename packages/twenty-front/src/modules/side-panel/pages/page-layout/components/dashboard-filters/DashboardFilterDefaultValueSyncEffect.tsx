import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useUpdatePageLayoutDashboardFilters } from '@/page-layout/dashboard-filters/hooks/useUpdatePageLayoutDashboardFilters';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useEffect } from 'react';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined, isRecordFilterValueValid } from 'twenty-shared/utils';

type DashboardFilterDefaultValueSyncEffectProps = {
  pageLayoutId: string;
  slot: DashboardFilterSlot;
};

// Mirrors the scratch RecordFilter, written by the reused filter inputs, into the slot default.
export const DashboardFilterDefaultValueSyncEffect = ({
  pageLayoutId,
  slot,
}: DashboardFilterDefaultValueSyncEffectProps) => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const { updatePageLayoutDashboardFilterSlot } =
    useUpdatePageLayoutDashboardFilters(pageLayoutId);

  const { id: slotId, defaultOperand, defaultValue } = slot;

  useEffect(() => {
    const [currentRecordFilter] = currentRecordFilters;

    // The scratch stays empty until the dropdown is opened, so an empty list says nothing about the default.
    if (!isDefined(currentRecordFilter)) {
      return;
    }

    const nextDefaultValue = isRecordFilterValueValid(currentRecordFilter)
      ? currentRecordFilter.value
      : null;

    if (
      defaultOperand === currentRecordFilter.operand &&
      (defaultValue ?? null) === nextDefaultValue
    ) {
      return;
    }

    updatePageLayoutDashboardFilterSlot(slotId, {
      defaultOperand: currentRecordFilter.operand,
      defaultValue: nextDefaultValue,
    });
  }, [
    currentRecordFilters,
    defaultOperand,
    defaultValue,
    slotId,
    updatePageLayoutDashboardFilterSlot,
  ]);

  return null;
};
