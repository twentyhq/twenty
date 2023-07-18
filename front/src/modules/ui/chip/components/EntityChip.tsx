import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Theme } from '@emotion/react';
import styled from '@emotion/styled';

import { Avatar, AvatarType } from '@/users/components/Avatar';

const baseStyle = ({ theme }: { theme: Theme }) => `
  align-items: center;
  border-radius: ${theme.spacing(1)};
  color: ${theme.font.color.primary};
  display: inline-flex;
  gap: ${theme.spacing(1)};
  height: 12px;
  overflow: hidden;
  padding: ${theme.spacing(1)};
  text-decoration: none;
 
  img {
    border-radius: ${theme.border.radius.rounded};
    height: 14px;
    object-fit: cover;
    width: 14px;
  }

  white-space: nowrap;
`;

const StyledContainerLink = styled.div<{ customColor?: string }>`
  ${baseStyle}
  background-color: ${({ theme, customColor }) =>
    customColor ? customColor : theme.background.tertiary};
  :hover {
    filter: brightness(95%);
  }
`;

const StyledContainerReadOnly = styled.div`
  ${baseStyle}
`;

const StyledName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type OwnProps = {
  linkToEntity: string;
  entityId: string;
  name: string;
  picture?: string;
  clickable?: boolean;
  avatarType?: AvatarType;
  customColor?: string;
};

export function EntityChip({
  linkToEntity,
  entityId,
  name,
  picture,
  clickable,
  avatarType = 'rounded',
  customColor,
}: OwnProps) {
  const navigate = useNavigate();

  function handleLinkClick(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    navigate(linkToEntity);
  }

  return clickable && linkToEntity ? (
    <StyledContainerLink
      customColor={customColor}
      data-testid="entity-chip"
      onClick={handleLinkClick}
    >
      <Avatar
        avatarUrl={picture}
        colorId={entityId}
        placeholder={name}
        size={14}
        type={avatarType}
      />
      <StyledName>{name}</StyledName>
    </StyledContainerLink>
  ) : (
    <StyledContainerReadOnly data-testid="entity-chip">
      <Avatar
        avatarUrl={picture}
        colorId={entityId}
        placeholder={name}
        size={14}
        type={avatarType}
      />
      <StyledName>{name}</StyledName>
    </StyledContainerReadOnly>
  );
}
