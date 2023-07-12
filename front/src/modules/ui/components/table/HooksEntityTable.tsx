import { FilterDefinition } from '@/lib/filters-and-sorts/types/FilterDefinition';
import { useInitializeEntityTable } from '@/ui/tables/hooks/useInitializeEntityTable';
import { useInitializeEntityTableFilters } from '@/ui/tables/hooks/useInitializeEntityTableFilters';
import { useMapKeyboardToSoftFocus } from '@/ui/tables/hooks/useMapKeyboardToSoftFocus';

export function HooksEntityTable({
  numberOfColumns,
  numberOfRows,
  availableTableFilters,
}: {
  numberOfColumns: number;
  numberOfRows: number;
  availableTableFilters: FilterDefinition[];
}) {
  useMapKeyboardToSoftFocus();

  useInitializeEntityTable({
    numberOfColumns,
    numberOfRows,
  });

  useInitializeEntityTableFilters({
    availableTableFilters,
  });

  return <></>;
}
