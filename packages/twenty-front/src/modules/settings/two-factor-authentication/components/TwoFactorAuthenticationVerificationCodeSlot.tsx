import { styled } from '@linaria/react';
import { type SlotProps } from 'input-otp';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSlot = styled.div<{ isActive: boolean }>`
  position: relative;
  width: 24px;
  height: 32px;
  font-size: ${themeCssVariables.font.size.md};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};

  .group:hover &,
  .group:focus-within & {
    border-color: ${themeCssVariables.border.color.medium};
  }

  outline: 0;
  outline-color: ${themeCssVariables.border.color.medium};

  outline-color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.border.color.strong
      : themeCssVariables.border.color.medium};
  outline-style: ${({ isActive }) => (isActive ? 'solid' : 'none')};
  outline-width: ${({ isActive }) => (isActive ? '1px' : '0')};
`;

const StyledCaretContainer = styled.div`
  align-items: center;
  animation: caret-blink 1s steps(2, start) infinite;
  display: flex;
  inset: 0;
  justify-content: center;
  pointer-events: none;
  position: absolute;

  @keyframes caret-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

const StyledPlaceholderChar = styled.div`
  opacity: 0.2;
`;

const StyledInputChar = styled.div`
  opacity: 1;
`;

const StyledCaret = styled.div`
  width: 1px;
  height: 20px;
  background-color: ${themeCssVariables.font.color.primary};
`;

type TwoFactorAuthenticationVerificationCodeSlotProps = SlotProps;

export const TwoFactorAuthenticationVerificationCodeSlot = ({
  char,
  hasFakeCaret,
  isActive,
  placeholderChar,
}: TwoFactorAuthenticationVerificationCodeSlotProps) => {
  return (
    <StyledSlot isActive={isActive}>
      {char ? (
        <StyledInputChar>{char}</StyledInputChar>
      ) : (
        <StyledPlaceholderChar>{placeholderChar ?? 'X'}</StyledPlaceholderChar>
      )}
      {hasFakeCaret && (
        <StyledCaretContainer>
          <StyledCaret />
        </StyledCaretContainer>
      )}
    </StyledSlot>
  );
};
