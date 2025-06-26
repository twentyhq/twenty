import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useListenToSidePanelOpening } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelOpening';

export const RecordInlineCellCloseOnCommandMenuOpeningEffect = () => {
  const { closeInlineCell } = useInlineCell();

  useListenToSidePanelOpening(closeInlineCell);

  return null;
};
