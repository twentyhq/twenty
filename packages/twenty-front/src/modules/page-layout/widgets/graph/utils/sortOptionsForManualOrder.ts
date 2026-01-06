import { sortByManualOrder } from '@/page-layout/widgets/graph/utils/sortByManualOrder';
import { isDefined } from 'twenty-shared/utils';

type SelectFieldOption = {
  value: string;
  position?: number | null;
};

export const sortOptionsForManualOrder = <T extends SelectFieldOption>(
  options: T[],
  manualSortOrder?: string[] | null,
): T[] => {
  if (!isDefined(manualSortOrder) || manualSortOrder.length === 0) {
    return options.toSorted((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  return sortByManualOrder({
    items: options.toSorted((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    manualSortOrder,
    getRawValue: (option) => option.value,
  });
};
