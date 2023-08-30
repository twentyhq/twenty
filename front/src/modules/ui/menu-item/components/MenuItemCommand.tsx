import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';

import {
  StyledMenuItemBase,
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
`;

const StyledMenuItemCommandContainer = styled(StyledMenuItemBase)`
  height: 24px;
`;

export type MenuItemProps = {
  LeftIcon?: IconComponent;
  text: string;
  command: string;
  className: string;
  onClick?: () => void;
};

export function MenuItemCommand({
  LeftIcon,
  text,
  command,
  className,
  onClick,
}: MenuItemProps) {
  const theme = useTheme();

  return (
    <StyledMenuItemCommandContainer onClick={onClick} className={className}>
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
}
