import { TableFilterDefinition } from '@/filters-and-sorts/types/TableFilterDefinition';
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
  availableTableFilters: TableFilterDefinition[];
}) {
  console.log('HooksEntityTable');
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
