import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/themes/effects';

import { InplaceInputContainer } from './InplaceInputContainer';

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

export function InplaceInputText({
  placeholder,
  value,
  onChange,
  autoFocus,
}: OwnProps) {
  return (
    <InplaceInputContainer>
      <InplaceInputTextInput
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </InplaceInputContainer>
  );
}
