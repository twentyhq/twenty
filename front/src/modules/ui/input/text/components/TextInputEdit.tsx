import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/theme/constants/effects';

import { TextInputContainer } from './TextInputContainer';

export const InplaceInputTextInput = styled.input`
  margin: 0;
  width: 100%;
  ${textInputStyle}
`;

type OwnProps = {
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
}: OwnProps) {
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
