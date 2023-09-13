import { useEditableCell } from '../hooks/useEditableCell';
import { useSetSoftFocusOnCurrentCell } from '../hooks/useSetSoftFocusOnCurrentCell';

import { EditableCellDisplayContainer } from './EditableCellDisplayContainer';

export function EditableCellDisplayMode({
  children,
  isHovered,
}: React.PropsWithChildren<unknown> & { isHovered?: boolean }) {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();

  const { openEditableCell } = useEditableCell();

  function handleClick() {
    setSoftFocusOnCurrentCell();
    openEditableCell();
  }

  return (
    <EditableCellDisplayContainer isHovered={isHovered} onClick={handleClick}>
      {children}
    </EditableCellDisplayContainer>
  );
}
