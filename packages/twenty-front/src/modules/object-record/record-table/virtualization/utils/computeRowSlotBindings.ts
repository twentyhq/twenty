import { isDefined } from 'twenty-shared/utils';

import { type RowSlotBinding } from '@/object-record/record-table/virtualization/types/RowSlotBinding';

const getRowSlotBindingKey = (binding: RowSlotBinding) =>
  binding.type === 'record'
    ? `record-${binding.recordId}`
    : `skeleton-${binding.rowIndex}`;

export const computeRowSlotBindings = ({
  currentBindings,
  recordIdsByRowIndex,
  firstRowIndex,
  lastRowIndex,
}: {
  currentBindings: (RowSlotBinding | null)[];
  recordIdsByRowIndex: string[];
  firstRowIndex: number;
  lastRowIndex: number;
}): (RowSlotBinding | null)[] => {
  const wantedBindingByKey = new Map<string, RowSlotBinding>();

  for (let rowIndex = firstRowIndex; rowIndex <= lastRowIndex; rowIndex++) {
    const recordId = recordIdsByRowIndex[rowIndex];

    const binding: RowSlotBinding = isDefined(recordId)
      ? { type: 'record', recordId }
      : { type: 'skeleton', rowIndex };

    wantedBindingByKey.set(getRowSlotBindingKey(binding), binding);
  }

  const nextBindings = currentBindings.map((binding) =>
    isDefined(binding) && wantedBindingByKey.has(getRowSlotBindingKey(binding))
      ? binding
      : null,
  );

  for (const binding of nextBindings) {
    if (isDefined(binding)) {
      wantedBindingByKey.delete(getRowSlotBindingKey(binding));
    }
  }

  let freeRowSlot = 0;

  for (const binding of wantedBindingByKey.values()) {
    while (
      freeRowSlot < nextBindings.length &&
      isDefined(nextBindings[freeRowSlot])
    ) {
      freeRowSlot++;
    }

    if (freeRowSlot >= nextBindings.length) {
      break;
    }

    nextBindings[freeRowSlot] = binding;
  }

  return nextBindings;
};
