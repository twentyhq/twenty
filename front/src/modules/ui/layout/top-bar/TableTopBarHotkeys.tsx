import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/ui/tables/types/HotkeyScope';

type OwnProps = {
  onAddButtonClick?: () => void;
};

export function TopBarHotkeys({ onAddButtonClick }: OwnProps) {
  useScopedHotkeys('c', () => onAddButtonClick?.(), HotkeyScope.Table, [
    onAddButtonClick,
  ]);

  return <></>;
}
