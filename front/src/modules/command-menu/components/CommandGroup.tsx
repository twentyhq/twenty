import React from 'react';
import styled from '@emotion/styled';
import { Command } from 'cmdk';

const StyledGroup = styled(Command.Group)`
  [cmdk-group-heading] {
    align-items: center;
    color: ${({ theme }) => theme.font.color.light};
    display: flex;
    font-size: ${({ theme }) => theme.font.size.xs};
    font-weight: ${({ theme }) => theme.font.weight.semiBold};
    padding-bottom: ${({ theme }) => theme.spacing(2)};
    padding-left: ${({ theme }) => theme.spacing(2)};
    padding-right: ${({ theme }) => theme.spacing(1)};
    padding-top: ${({ theme }) => theme.spacing(2)};
    text-transform: uppercase;
    user-select: none;
  }
`;

type OwnProps = {
  heading: string;
  children: React.ReactNode | React.ReactNode[];
};

export function CommandGroup({ heading, children }: OwnProps) {
  if (!React.Children.count(children)) {
    return null;
  }
  return <StyledGroup heading={heading}>{children}</StyledGroup>;
}
