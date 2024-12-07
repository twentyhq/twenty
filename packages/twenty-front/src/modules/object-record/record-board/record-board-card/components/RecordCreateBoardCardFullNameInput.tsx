import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { FieldDoubleText } from '@/object-record/record-field/types/FieldDoubleText';
import { DoubleTextInput } from '@/ui/field/input/components/DoubleTextInput';
import styled from '@emotion/styled';
import { useState } from 'react';
import { RGBA } from 'twenty-ui';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';

type RecordCreateBoardCardFullNameInputProps = {
  position: 'first' | 'last';
  onCreateSuccess?: () => void;
  label: string;
};

const StyledWrapper = styled.div`
  backdrop-filter: blur(12px) saturate(200%) contrast(50%) brightness(130%);
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid;
  box-shadow: ${({ theme }) =>
    `0px 0px 0px 3px ${RGBA(theme.color.blue, 0.1)}`};
  border-color: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: ${({ theme }) => theme.spacing(8)};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FIRST_NAME_PLACEHOLDER = 'First name';
const LAST_NAME_PLACEHOLDER = 'Last name';

export const RecordCreateBoardCardFullNameInput = ({
  position,
  onCreateSuccess,
  label,
}: RecordCreateBoardCardFullNameInputProps) => {
  const [newFullNameValue, setNewFullNameValue] = useState<FieldDoubleText>({
    firstValue: '',
    secondValue: '',
  });

  const { handleInputEnter, handleBlur } = useAddNewCard();

  const formatFullNameValue = (value: FieldDoubleText) => {
    return {
      firstName: value.firstValue.trim(),
      lastName: value.secondValue.trim(),
    };
  };
  useHotkeyScopeOnMount('boardCardFullNameCreate');

  const handleEnter = (value: FieldDoubleText) => {
    handleInputEnter(
      label,
      formatFullNameValue(value),
      position,
      onCreateSuccess,
    );
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    value: FieldDoubleText,
  ) => {
    handleBlur(label, formatFullNameValue(value), position, onCreateSuccess);
  };

  const handleEscape = (value: FieldDoubleText) => {
    handleBlur(label, formatFullNameValue(value), position, onCreateSuccess);
  };

  const handleChange = (value: FieldDoubleText) => {
    setNewFullNameValue(value);
  };

  return (
    <StyledWrapper>
      <DoubleTextInput
        firstValue={newFullNameValue.firstValue}
        secondValue={newFullNameValue.secondValue}
        firstValuePlaceholder={FIRST_NAME_PLACEHOLDER}
        secondValuePlaceholder={LAST_NAME_PLACEHOLDER}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onClickOutside={handleClickOutside}
        onChange={handleChange}
        hotkeyScope="boardCardFullNameCreate"
      />
    </StyledWrapper>
  );
};
