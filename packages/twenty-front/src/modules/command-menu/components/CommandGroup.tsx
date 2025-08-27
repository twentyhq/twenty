import styled from '@emotion/styled';
import React from 'react';
import { Label } from 'twenty-ui/display';

const StyledGroupHeading = styled(Label)`
  align-items: center;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  user-select: none;
`;

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

type CommandGroupProps = {
  heading: string;
  children: React.ReactNode | React.ReactNode[];
};

export const CommandGroup = ({ heading, children }: CommandGroupProps) => {
  if (!children || !React.Children.count(children)) {
    return null;
  }
  return (
    <>
      <StyledGroupHeading>{heading}</StyledGroupHeading>
      <StyledGroup>{children}</StyledGroup>
    </>
  );
};
