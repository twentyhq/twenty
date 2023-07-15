import styled from '@emotion/styled';
import { IconPencil } from '@tabler/icons-react';

import { IconButton } from '@/ui/components/buttons/IconButton';
import { overlayBackground } from '@/ui/themes/effects';

import { useEditableField } from '../hooks/useEditableField';

export const StyledEditableFieldEditButton = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};

  color: ${({ theme }) => theme.font.color.tertiary};

  cursor: pointer;
  display: flex;
  height: 20px;
  justify-content: center;

  margin-left: -2px;
  width: 20px;

  z-index: 1;
  ${overlayBackground}
`;

export function EditableFieldEditButton() {
  const { openEditableField } = useEditableField();

  function handleClick() {
    openEditableField();
  }

  return (
    <IconButton
      onClick={handleClick}
      icon={<IconPencil size={14} />}
      data-testid="editable-field-edit-mode-container"
    />
  );
}
