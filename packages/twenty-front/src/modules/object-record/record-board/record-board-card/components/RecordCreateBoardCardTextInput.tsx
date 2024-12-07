import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useState } from 'react';

type RecordCreateBoardCardTextInputProps = {
  position: 'first' | 'last';
  onCreateSuccess?: () => void;
  label: string;
};

const StyledTextInput = styled(TextInput)`
  backdrop-filter: blur(12px) saturate(200%) contrast(50%) brightness(130%);
  background: ${({ theme }) => theme.background.primary};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  width: ${({ theme }) => theme.spacing(53)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

export const RecordCreateBoardCardTextInput = ({
  position,
  onCreateSuccess,
  label,
}: RecordCreateBoardCardTextInputProps) => {
  const [newLabelValue, setNewLabelValue] = useState('');
  const { handleBlur, handleInputEnter } = useAddNewCard();

  return (
    <StyledTextInput
      autoFocus
      value={newLabelValue}
      onInputEnter={() =>
        handleInputEnter(label, newLabelValue, position, onCreateSuccess)
      }
      onBlur={() => handleBlur(label, newLabelValue, position, onCreateSuccess)}
      onChange={(text: string) => setNewLabelValue(text)}
      placeholder={label}
    />
  );
};
