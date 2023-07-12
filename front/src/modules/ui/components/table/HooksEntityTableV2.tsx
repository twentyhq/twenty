import { TableFilterDefinition } from '@/filters-and-sorts/types/TableFilterDefinition';
import { useInitializeEntityTableFilters } from '@/ui/tables/hooks/useInitializeEntityTableFilters';
import { useInitializeEntityTable } from '@/ui/tables/hooks/useInitializeEntityTableV2';
import { useMapKeyboardToSoftFocus } from '@/ui/tables/hooks/useMapKeyboardToSoftFocus';

export function HooksEntityTable({
  numberOfColumns,
  availableTableFilters,
}: {
  numberOfColumns: number;
  availableTableFilters: TableFilterDefinition[];
}) {
  console.log('HooksEntityTable');
  useMapKeyboardToSoftFocus();

  useInitializeEntityTable({
    numberOfColumns,
  });

  useInitializeEntityTableFilters({
    availableTableFilters,
  });

  return <></>;
}
