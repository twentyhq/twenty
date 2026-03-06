import { styled } from '@linaria/react';
import { type SlotProps } from 'input-otp';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSlot = styled.div<{ isActive: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  height: 32px;
  justify-content: center;
  outline: 0;
  outline-color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.border.color.strong
      : themeCssVariables.border.color.medium};
  outline-color: ${themeCssVariables.border.color.medium};

  .group:hover &,
  .group:focus-within & {
    border-color: ${themeCssVariables.border.color.medium};
  }

  outline-style: ${({ isActive }) => (isActive ? 'solid' : 'none')};
  outline-width: ${({ isActive }) => (isActive ? '1px' : '0')};

  position: relative;
  transition: all 0.3s;
  width: 24px;
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
  background-color: ${themeCssVariables.font.color.primary};
  height: 20px;
  width: 1px;
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
