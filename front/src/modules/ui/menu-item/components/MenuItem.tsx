import { ComponentType } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconButtonGroup } from '@/ui/button/components/IconButtonGroup';
import { hoverBackground } from '@/ui/theme/constants/effects';

import { MenuItemAccent } from '../types/MenuItemAccent';

const StyledItem = styled.li<Pick<MenuItemProps, 'accent'>>`
  --horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --vertical-padding: ${({ theme }) => theme.spacing(2)};

  align-items: center;

  border-radius: ${({ theme }) => theme.border.radius.sm};

  cursor: pointer;
  display: flex;
  flex-direction: row;

  font-size: ${({ theme }) => theme.font.size.sm};

  height: calc(32px - 2 * var(--vertical-padding));

  justify-content: space-between;

  padding: var(--vertical-padding) var(--horizontal-padding);

  ${hoverBackground};

  ${({ theme, accent }) => accent === 'danger' && `color: ${theme.color.red};`}

  position: relative;
  user-select: none;

  width: calc(100% - 2 * var(--horizontal-padding));
`;

const StyledMenuItemLabel = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledNoIconFiller = styled.div`
  width: ${({ theme }) => theme.spacing(1)};
`;

export const StyledMenuItemLeftContent = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;

  flex-direction: row;

  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledMenuItemIconContainer = styled.div`
  align-items: center;

  display: flex;
  justify-content: center;
  padding-left: ${({ theme }) => theme.spacing(0.5)};
`;

export const StyledMenuItemRightContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

export type MenuItemProps = {
  LeftIcon?: ComponentType<{ size: number }>;
  accent: MenuItemAccent;
  text: string;
  iconButtons?: {
    icon: ComponentType<{ size: number }>;
    onClick: () => void;
  }[];
  className: string;
};

export function MenuItem({
  LeftIcon,
  accent,
  text,
  iconButtons,
  className,
}: MenuItemProps) {
  const theme = useTheme();

  const showOneIconButton =
    Array.isArray(iconButtons) && iconButtons.length === 1;

  const showMultipleIconButtons =
    Array.isArray(iconButtons) && iconButtons.length > 1;

  return (
    <StyledItem className={className} accent={accent}>
      <StyledMenuItemLeftContent>
        {LeftIcon ? (
          <StyledMenuItemIconContainer>
            <LeftIcon size={theme.icon.size.md} />
          </StyledMenuItemIconContainer>
        ) : (
          <StyledNoIconFiller />
        )}
        <StyledMenuItemLabel>{text}</StyledMenuItemLabel>
      </StyledMenuItemLeftContent>
      {showOneIconButton ? (
        <>
          {iconButtons?.map(({ icon: Icon, onClick }, index) => (
            <IconButton
              size="small"
              icon={<Icon size={theme.icon.size.sm} />}
              key={index}
              onClick={onClick}
            />
          ))}
        </>
      ) : showMultipleIconButtons ? (
        <IconButtonGroup>
          {iconButtons?.map(({ icon: Icon, onClick }, index) => (
            <IconButton
              size="small"
              icon={<Icon size={theme.icon.size.sm} />}
              key={index}
              onClick={onClick}
            />
          ))}
        </IconButtonGroup>
      ) : (
        <></>
      )}
    </StyledItem>
  );
}
