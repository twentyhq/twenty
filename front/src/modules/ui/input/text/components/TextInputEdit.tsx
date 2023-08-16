import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/theme/constants/effects';

import { TextInputContainer } from './TextInputContainer';

const InplaceInputTextInput = styled.input`
  margin: 0;
  width: 100%;
  ${textInputStyle}
`;

export type TextInputEditProps = {
  placeholder?: string;
  value?: string;
  onChange?: (newValue: string) => void;
  autoFocus?: boolean;
};

export function TextInputEdit({
  placeholder,
  value,
  onChange,
  autoFocus,
}: TextInputEditProps) {
  return (
    <TextInputContainer>
      <InplaceInputTextInput
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </TextInputContainer>
  );
}
