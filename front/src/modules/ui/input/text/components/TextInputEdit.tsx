import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/theme/constants/effects';
import { overlayBackground } from '@/ui/theme/constants/effects';

const StyledInplaceInputTextInput = styled.input`
  margin: 0;
  width: 100%;
  ${textInputStyle}
`;

const StyledTextInputContainer = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  margin-left: -1px;
  min-height: 32px;
  width: inherit;

  ${overlayBackground}

  z-index: 10;
`;

export type TextInputEditProps = {
  placeholder?: string;
  value?: string;
  onChange?: (newValue: string) => void;
  autoFocus?: boolean;
};

export const TextInputEdit = ({
  placeholder,
  value,
  onChange,
  autoFocus,
}: TextInputEditProps) => (
  <StyledTextInputContainer>
    <StyledInplaceInputTextInput
      autoComplete="off"
      autoFocus={autoFocus}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </StyledTextInputContainer>
);
