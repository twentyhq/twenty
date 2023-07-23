import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';

import { useInitializeEntityTable } from '../hooks/useInitializeEntityTable';
import { useInitializeEntityTableFilters } from '../hooks/useInitializeEntityTableFilters';
import { useMapKeyboardToSoftFocus } from '../hooks/useMapKeyboardToSoftFocus';

export function HooksEntityTable({
  numberOfColumns,
  availableFilters,
}: {
  numberOfColumns: number;
  availableFilters: FilterDefinition[];
}) {
  console.log('HooksEntityTable');
  useMapKeyboardToSoftFocus();

  // useInitializeEntityTable({
  //   numberOfColumns,
  // });

  // useInitializeEntityTableFilters({
  //   availableFilters,
  // });

  return <></>;
}
