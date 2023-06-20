import React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  children: React.ReactNode;
  fullWidth?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const StyledButton = styled.button<{ fullWidth: boolean }>`
  align-items: center;
  background: ${({ theme }) => theme.primaryBackground};
  border: 1px solid ${({ theme }) => theme.primaryBorder};
  border-radius: 8px;
  box-shadow: 0px 0px 4px ${({ theme }) => theme.mediumBackgroundTransparent} 0%,
    0px 2px 4px ${({ theme }) => theme.lightBackgroundTransparent} 0%;
  color: ${(props) => props.theme.text80};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.fontWeightBold};
  gap: 8px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  padding: 8px 32px;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  &:hover {
    background: ${({ theme }) => theme.tertiaryBackground};
  }
`;

export function SecondaryButton({
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
