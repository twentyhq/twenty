import { ComponentProps, MouseEvent } from 'react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';

const StyledHeader = styled.li`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  padding: ${({ theme }) => theme.spacing(1)};

  user-select: none;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledChildrenWrapper = styled.span`
  padding: 0 ${({ theme }) => theme.spacing(1)};
`;

const StyledLightIconButton = styled(LightIconButton)`
  display: inline-flex;
  margin-left: auto;
  margin-right: 0;
`;

type DropdownMenuHeaderProps = ComponentProps<'li'> & {
  StartIcon?: IconComponent;
  EndIcon?: IconComponent;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  testId?: string;
};

export const DropdownMenuHeader = ({
  children,
  StartIcon,
  EndIcon,
  onClick,
  testId,
}: DropdownMenuHeaderProps) => {
  return (
    <StyledHeader data-testid={testId} onClick={onClick}>
      {StartIcon && (
        <LightIconButton
          testId="dropdown-menu-header-end-icon"
          Icon={StartIcon}
          accent="tertiary"
          size="small"
        />
      )}
      <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
      {EndIcon && (
        <StyledLightIconButton
          testId="dropdown-menu-header-end-icon"
          Icon={EndIcon}
          accent="tertiary"
          size="small"
        />
      )}
    </StyledHeader>
  );
};
