import styled from '@emotion/styled';
import React from 'react';

const StyledGroup = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  user-select: none;
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
    <div>
      <StyledGroup>{heading}</StyledGroup>
      {children}
    </div>
  );
};
