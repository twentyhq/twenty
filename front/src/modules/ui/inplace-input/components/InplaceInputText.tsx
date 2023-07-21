import styled from '@emotion/styled';

import { bigTextInputStyle, textInputStyle } from '@/ui/themes/effects';

import { InplaceInputContainer } from './InplaceInputContainer';

export const InplaceInputTextInput = styled.input<{ isTitle?: boolean }>`
  margin: 0;
  width: 100%;
  ${({ isTitle }) => (isTitle ? bigTextInputStyle : textInputStyle)}
`;

type OwnProps = {
  placeholder?: string;
  value?: string;
  onChange?: (newValue: string) => void;
  autoFocus?: boolean;
  isTitle?: boolean;
};

export function InplaceInputText({
  placeholder,
  value,
  onChange,
  autoFocus,
  isTitle,
}: OwnProps) {
  return (
    <InplaceInputContainer>
      <InplaceInputTextInput
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        isTitle={isTitle}
      />
    </InplaceInputContainer>
  );
}
