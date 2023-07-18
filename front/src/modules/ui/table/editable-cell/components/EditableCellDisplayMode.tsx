import { useSetSoftFocusOnCurrentCell } from '../hooks/useSetSoftFocusOnCurrentCell';

import { EditableCellDisplayContainer } from './EditableCellContainer';

export function EditableCellDisplayMode({
  children,
}: React.PropsWithChildren<unknown>) {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();

  function handleClick() {
    setSoftFocusOnCurrentCell();
  }

  return (
    <EditableCellDisplayContainer onClick={handleClick}>
      {children}
    </EditableCellDisplayContainer>
  );
}
