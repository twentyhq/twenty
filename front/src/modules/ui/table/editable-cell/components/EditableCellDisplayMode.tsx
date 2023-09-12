import { useEditableCell } from '../hooks/useEditableCell';
import { useSetSoftFocusOnCurrentCell } from '../hooks/useSetSoftFocusOnCurrentCell';

import { EditableCellDisplayContainer } from './EditableCellDisplayContainer';

export function EditableCellDisplayMode({
  children,
}: React.PropsWithChildren<unknown>) {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();

  const { openEditableCell } = useEditableCell();

  function handleClick() {
    setSoftFocusOnCurrentCell();
    openEditableCell();
  }

  return (
    <EditableCellDisplayContainer onClick={handleClick}>
      {children}
    </EditableCellDisplayContainer>
  );
}
