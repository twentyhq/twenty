import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
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

type StyledRightIconProps = {
  isMobile: boolean;
};

const StyledRightIcon = styled.div<StyledRightIconProps>`
  cursor: pointer;
  margin-left: ${({ theme }) => theme.spacing(2)};
  transition: opacity 150ms ease-in-out;
  opacity: ${({ isMobile }) => (isMobile ? 1 : 0)};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  width: ${({ theme }) => theme.spacing(5)};
  height: ${({ theme }) => theme.spacing(5)};
  :hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }

  .title-container:hover & {
    opacity: 1;
  }

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
  const isMobile = useIsMobile();

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
    <StyledTitle className="title-container" onClick={handleTitleClick}>
      <StyledLabel>{label}</StyledLabel>
      {rightIcon && (
        <StyledRightIcon isMobile={isMobile} onClick={handleRightIconClick}>
          {rightIcon}
        </StyledRightIcon>
      )}
    </StyledTitle>
  );
};
