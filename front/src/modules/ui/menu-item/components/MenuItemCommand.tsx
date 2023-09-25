import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Command } from 'cmdk';

import { IconComponent } from '@/ui/icon/types/IconComponent';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

const StyledMenuItemLabelText = styled(StyledMenuItemLabel)`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledBigIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};

  display: flex;

  flex-direction: row;

  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledCommandText = styled.div`
  color: ${({ theme }) => theme.font.color.light};

  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledMenuItemCommandContainer = styled(Command.Item)`
  --horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --vertical-padding: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  height: calc(32px - 2 * var(--vertical-padding));
  height: 24px;
  justify-content: space-between;
  padding: var(--vertical-padding) var(--horizontal-padding);
  position: relative;
  transition: all 150ms ease;
  transition-property: none;
  user-select: none;
  width: calc(100% - 2 * var(--horizontal-padding));
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
  &[data-selected='true'] {
    background: ${({ theme }) => theme.background.tertiary};
    /* Could be nice to add a caret like this for better accessibility in the future
    But it needs to be consistend with other picker dropdown (e.g. company)
    &:after {
      background: ${({ theme }) => theme.background.quaternary};
      content: '';
      height: 100%;
      left: 0;
      position: absolute;
      width: 3px;
      z-index: ${({ theme }) => theme.lastLayerZIndex};
    } */
  }
  &[data-disabled='true'] {
    color: ${({ theme }) => theme.font.color.light};
    cursor: not-allowed;
  }
  svg {
    height: 16px;
    width: 16px;
  }
`;

export type MenuItemProps = {
  LeftIcon?: IconComponent;
  text: string;
  command: string;
  className?: string;
  onClick?: () => void;
};

export const MenuItemCommand = ({
  LeftIcon,
  text,
  command,
  className,
  onClick,
}: MenuItemProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemCommandContainer onSelect={onClick} className={className}>
      <StyledMenuItemLeftContent>
        {LeftIcon && (
          <StyledBigIconContainer>
            <LeftIcon size={theme.icon.size.sm} />
          </StyledBigIconContainer>
        )}
        <StyledMenuItemLabelText hasLeftIcon={!!LeftIcon}>
          {text}
        </StyledMenuItemLabelText>
      </StyledMenuItemLeftContent>
      <StyledCommandText>{command}</StyledCommandText>
    </StyledMenuItemCommandContainer>
  );
};
