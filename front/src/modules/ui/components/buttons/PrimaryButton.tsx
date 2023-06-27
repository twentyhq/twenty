import React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  children: React.ReactNode;
  fullWidth?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const StyledButton = styled.button<{ fullWidth: boolean }>`
  align-items: center;
  background: radial-gradient(
    50% 62.62% at 50% 0%,
    ${({ theme }) => theme.font.color.secondary} 0%,
    ${({ theme }) => theme.font.color.primary} 100%
  );
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 8px;
  box-shadow: 0px 0px 4px ${({ theme }) => theme.background.transparent.medium}
      0%,
    0px 2px 4px ${({ theme }) => theme.background.transparent.light} 0%;
  color: ${({ theme }) => theme.font.color.inverted};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

export function PrimaryButton({
  children,
  fullWidth,
  ...props
}: OwnProps): JSX.Element {
  return (
    <StyledButton fullWidth={fullWidth ?? false} {...props}>
      {children}
    </StyledButton>
  );
}
