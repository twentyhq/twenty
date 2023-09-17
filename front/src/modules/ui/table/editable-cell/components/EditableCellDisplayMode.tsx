import { useEditableCell } from '../hooks/useEditableCell';
import { useSetSoftFocusOnCurrentCell } from '../hooks/useSetSoftFocusOnCurrentCell';

import { EditableCellDisplayContainer } from './EditableCellDisplayContainer';

export const EditableCellDisplayMode = ({
  children,
  isHovered,
}: React.PropsWithChildren<unknown> & { isHovered?: boolean }) => {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();

  const { openEditableCell } = useEditableCell();

  const handleClick = () => {
    setSoftFocusOnCurrentCell();
    openEditableCell();
  };

  return (
    <EditableCellDisplayContainer isHovered={isHovered} onClick={handleClick}>
      {children}
    </EditableCellDisplayContainer>
  );
};
