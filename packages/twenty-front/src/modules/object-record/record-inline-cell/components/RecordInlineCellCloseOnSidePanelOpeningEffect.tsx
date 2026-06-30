import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useListenToSidePanelOpening } from '@/ui/layout/side-panel/hooks/useListenToSidePanelOpening';

// TODO: This is a temporary solution to close the inline cell when the side panel is opened.
// This is because the useInlineCell hook doesn't work correctly for field inputs when used outside of the field context.
// We should refactor field inputs, and remove this listener afterwards.
// TODO: create a new hook useCloseAnyOpenedFieldInput which uses the focus stack to close all the field inputs, and call it inside openSidePanelMenu
export const RecordInlineCellCloseOnSidePanelOpeningEffect = () => {
  const { closeInlineCell } = useInlineCell();

  useListenToSidePanelOpening(closeInlineCell);

  return null;
};
