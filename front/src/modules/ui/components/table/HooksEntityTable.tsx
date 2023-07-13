import { FilterDefinition } from '@/lib/filters-and-sorts/types/FilterDefinition';
import { useInitializeEntityTable } from '@/ui/tables/hooks/useInitializeEntityTable';
import { useInitializeEntityTableFilters } from '@/ui/tables/hooks/useInitializeEntityTableFilters';
import { useMapKeyboardToSoftFocus } from '@/ui/tables/hooks/useMapKeyboardToSoftFocus';

export function HooksEntityTable({
  numberOfColumns,
  availableFilters,
}: {
  numberOfColumns: number;
  availableFilters: FilterDefinition[];
}) {
  useMapKeyboardToSoftFocus();

  useInitializeEntityTable({
    numberOfColumns,
  });

  useInitializeEntityTableFilters({
    availableFilters,
  });

  return <></>;
}
