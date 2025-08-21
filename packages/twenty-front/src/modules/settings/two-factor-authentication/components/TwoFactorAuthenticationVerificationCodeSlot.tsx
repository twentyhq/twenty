import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type SlotProps } from 'input-otp';

const StyledSlot = styled.div<{ isActive: boolean }>`
  position: relative;
  width: 24px;
  height: 32px;
  font-size: ${({ theme }) => theme.font.size.md};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};

  .group:hover &,
  .group:focus-within & {
    border-color: ${({ theme }) => theme.border.color.medium};
  }

  outline: 0;
  outline-color: ${({ theme }) => theme.border.color.medium};

  ${({ isActive, theme }) =>
    isActive &&
    css`
      outline-width: 1px;
      outline-style: solid;
      outline-color: ${theme.border.color.strong};
    `}
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
  background-color: ${({ theme }) => theme.font.color.primary};
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
