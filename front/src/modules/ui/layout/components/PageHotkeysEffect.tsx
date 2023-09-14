import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

type OwnProps = {
  onAddButtonClick?: () => void;
};

export function PageHotkeysEffect({ onAddButtonClick }: OwnProps) {
  useScopedHotkeys('c', () => onAddButtonClick?.(), TableHotkeyScope.Table, [
    onAddButtonClick,
  ]);

  return <></>;
}
