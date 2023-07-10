import * as React from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '@emotion/react';
import styled from '@emotion/styled';

import { Avatar } from '@/users/components/Avatar';

export type PersonChipPropsType = {
  id: string;
  name: string;
  picture?: string;
};

const baseStyle = ({ theme }: { theme: Theme }) => `
  align-items: center;
  background-color: ${theme.background.tertiary};
  border-radius: ${theme.spacing(1)};
  color: ${theme.font.color.primary};
  display: inline-flex;
  gap: ${theme.spacing(1)};
  height: 12px;
  overflow: hidden;
  padding: ${theme.spacing(1)};
  text-decoration: none;
  :hover {
    filter: brightness(95%);
  }
  img {
    border-radius: ${theme.border.radius.rounded};
    height: 14px;
    object-fit: cover;
    width: 14px;
  }
  white-space: nowrap;
`;

const StyledContainerLink = styled(Link)`
  ${baseStyle}
`;

const StyledContainerNoLink = styled.div`
  ${baseStyle}
`;

const StyledName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function PersonChip({ id, name, picture }: PersonChipPropsType) {
  const ContainerComponent = id ? StyledContainerLink : StyledContainerNoLink;
  return (
    <ContainerComponent data-testid="person-chip" to={`/person/${id}`}>
      <Avatar
        avatarUrl={picture}
        colorId={id}
        placeholder={name}
        size={14}
        type="rounded"
      />
      <StyledName>{name}</StyledName>
    </ContainerComponent>
  );
}
