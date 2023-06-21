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
    ${({ theme }) => theme.text60} 0%,
    ${({ theme }) => theme.text80} 100%
  );
  border: 1px solid ${({ theme }) => theme.primaryBorder};
  border-radius: 8px;
  box-shadow: 0px 0px 4px ${({ theme }) => theme.mediumBackgroundTransparent} 0%,
    0px 2px 4px ${({ theme }) => theme.lightBackgroundTransparent} 0%;
  color: ${(props) => props.theme.text0};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.fontWeightBold};
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
