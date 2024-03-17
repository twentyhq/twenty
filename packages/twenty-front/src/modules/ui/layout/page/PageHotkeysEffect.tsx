import { useScopedHotkeys } from 'twenty-ui';

import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';

type PageHotkeysEffectProps = {
  onAddButtonClick?: () => void;
};

export const PageHotkeysEffect = ({
  onAddButtonClick,
}: PageHotkeysEffectProps) => {
  useScopedHotkeys('c', () => onAddButtonClick?.(), TableHotkeyScope.Table, [
    onAddButtonClick,
  ]);

  return <></>;
};
