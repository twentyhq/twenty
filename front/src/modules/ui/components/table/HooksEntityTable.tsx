import { EntityFilter } from '@/filters-and-sorts/types/EntityFilter';
import { useInitializeEntityTable } from '@/ui/tables/hooks/useInitializeEntityTable';
import { useInitializeEntityTableFilters } from '@/ui/tables/hooks/useInitializeEntityTableFilters';
import { useMapKeyboardToSoftFocus } from '@/ui/tables/hooks/useMapKeyboardToSoftFocus';

export function HooksEntityTable({
  numberOfColumns,
  numberOfRows,
  availableFilters,
}: {
  numberOfColumns: number;
  numberOfRows: number;
  availableFilters: EntityFilter[];
}) {
  useMapKeyboardToSoftFocus();

  useInitializeEntityTable({
    numberOfColumns,
    numberOfRows,
  });

  useInitializeEntityTableFilters({
    availableFilters,
  });

  return <></>;
}
