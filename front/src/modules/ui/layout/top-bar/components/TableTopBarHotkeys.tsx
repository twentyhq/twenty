import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';

type OwnProps = {
  onAddButtonClick?: () => void;
};

export function TopBarHotkeys({ onAddButtonClick }: OwnProps) {
  useScopedHotkeys('c', () => onAddButtonClick?.(), TableHotkeyScope.Table, [
    onAddButtonClick,
  ]);

  return <></>;
}
