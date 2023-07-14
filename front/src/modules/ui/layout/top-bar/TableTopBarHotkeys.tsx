import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { TableHotkeyScope } from '@/ui/tables/types/TableHotkeyScope';

type OwnProps = {
  onAddButtonClick?: () => void;
};

export function TopBarHotkeys({ onAddButtonClick }: OwnProps) {
  useScopedHotkeys('c', () => onAddButtonClick?.(), TableHotkeyScope.Table, [
    onAddButtonClick,
  ]);

  return <></>;
}
