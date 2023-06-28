import { useInitializeEntityTable } from '@/ui/tables/hooks/useInitializeEntityTable';
import { useMapKeyboardToSoftFocus } from '@/ui/tables/hooks/useMapKeyboardToSoftFocus';

export function HooksEntityTable({
  numberOfColumns,
  numberOfRows,
}: {
  numberOfColumns: number;
  numberOfRows: number;
}) {
  useMapKeyboardToSoftFocus();

  useInitializeEntityTable({
    numberOfColumns,
    numberOfRows,
  });

  return <></>;
}
