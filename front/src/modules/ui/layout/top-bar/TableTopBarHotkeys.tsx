import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

type OwnProps = {
  onAddButtonClick?: () => void;
};

export function TopBarHotkeys({ onAddButtonClick }: OwnProps) {
  useScopedHotkeys(
    'c',
    () => onAddButtonClick?.(),
    InternalHotkeysScope.Table,
    [onAddButtonClick],
  );

  return <></>;
}
