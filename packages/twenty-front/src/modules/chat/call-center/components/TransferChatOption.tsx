/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { MouseEvent, ReactNode } from 'react';
import { Avatar, IconCheck, useIcons } from 'twenty-ui/display';
import {
  MenuItemAccent,
  MenuItemLeftContent,
  StyledHoverableMenuItemBase,
} from 'twenty-ui/navigation';

import { WorkspaceMember } from '~/generated/graphql';

export type TransferChatOptionProps = {
  accent?: MenuItemAccent;
  className?: string;
  isIconDisplayedOnHoverOnly?: boolean;
  LeftIcon?: string;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void;
  testId?: string;
  text?: ReactNode;
  isSelected?: boolean;
  hasAvatar?: boolean;
  agent?: WorkspaceMember;
};

const StyledMenuItem = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: 5.5px ${({ theme }) => theme.spacing(2)};
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
`;

const StyledIconCheck = styled(IconCheck)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledDiv = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const TransferChatOption = ({
  accent = 'default',
  className,
  isIconDisplayedOnHoverOnly = true,
  LeftIcon,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  text,
  isSelected,
  agent,
  hasAvatar,
}: TransferChatOptionProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const icon = getIcon(LeftIcon);

  const handleMenuItemClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    event.preventDefault();
    event.stopPropagation();

    onClick?.(event);
  };

  return (
    <StyledHoverableMenuItemBase
      data-testid={testId ?? undefined}
      onClick={handleMenuItemClick}
      className={className}
      accent={accent}
      isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <StyledMenuItem>
        {hasAvatar ? (
          <StyledDiv>
            <Avatar
              placeholder={agent?.name.firstName}
              avatarUrl={agent?.avatarUrl}
              size="md"
              type="rounded"
            />
            {`${agent?.name.firstName} ${agent?.name.lastName}`}
          </StyledDiv>
        ) : (
          <MenuItemLeftContent LeftIcon={icon ?? undefined} text={text} />
        )}
      </StyledMenuItem>
      {isSelected && <StyledIconCheck size={theme.icon.size.sm} />}
    </StyledHoverableMenuItemBase>
  );
};
