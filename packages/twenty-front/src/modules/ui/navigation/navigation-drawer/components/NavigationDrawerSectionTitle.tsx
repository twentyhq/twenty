import styled from '@emotion/styled';
import React from 'react';
import { isDefined } from 'twenty-ui';

const StyledTitle = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  height: ${({ theme }) => theme.spacing(5)};
  padding: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledLabel = styled.div`
  flex-grow: 1;
`;

const StyledRightIcon = styled.div`
  cursor: pointer;
  margin-left: ${({ theme }) => theme.spacing(2)};

  &:active {
    cursor: pointer;
  }
`;

type NavigationDrawerSectionTitleProps = {
  onClick?: () => void;
  onRightIconClick?: () => void;
  label: string;
  rightIcon?: React.ReactNode;
};

export const NavigationDrawerSectionTitle = ({
  onClick,
  onRightIconClick,
  label,
  rightIcon,
}: NavigationDrawerSectionTitleProps) => {
  const handleTitleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isDefined(onClick)) {
      onClick();
    }
  };

  const handleRightIconClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isDefined(onRightIconClick)) {
      onRightIconClick();
    }
  };

  return (
    <StyledTitle onClick={handleTitleClick}>
      <StyledLabel>{label}</StyledLabel>
      {rightIcon && (
        <StyledRightIcon onClick={handleRightIconClick}>
          {rightIcon}
        </StyledRightIcon>
      )}
    </StyledTitle>
  );
};
