import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type TabInlineRenameInputProps = {
  initialValue: string;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
};

const StyledInputWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;

export const TabInlineRenameInput = ({
  initialValue,
  onSave,
  onCancel,
}: TabInlineRenameInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (isDefined(value)) {
      event.target.select();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const newTitle = value.trim() || initialValue;
      onSave(newTitle);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    const newTitle = value.trim() || initialValue;
    onSave(newTitle);
  };

  return (
    <StyledInputWrapper>
      <TextInput
        ref={inputRef}
        autoGrow
        sizeVariant="sm"
        inheritFontStyles
        value={value}
        onChange={setValue}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoFocus
      />
    </StyledInputWrapper>
  );
};
