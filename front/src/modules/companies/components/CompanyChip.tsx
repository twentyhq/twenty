import { Link } from 'react-router-dom';
import { Theme } from '@emotion/react';
import styled from '@emotion/styled';

import { Avatar } from '@/users/components/Avatar';

export type CompanyChipPropsType = {
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
  height: calc(20px - 2 * ${theme.spacing(1)});
  overflow: hidden;
  padding: ${theme.spacing(1)};

  text-decoration: none;

  user-select: none;

  :hover {
    filter: brightness(95%);
  }

  img {
    height: 14px;
    object-fit: cover;
    width: 14px;
  }
`;

const StyledName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledContainerLink = styled(Link)`
  ${baseStyle}
`;

const StyledContainerNoLink = styled.div`
  ${baseStyle}
`;

function CompanyChip({ id, name, picture }: CompanyChipPropsType) {
  const ContainerComponent = id ? StyledContainerLink : StyledContainerNoLink;

  return (
    <ContainerComponent data-testid="company-chip" to={`/companies/${id}`}>
      {picture && (
        <Avatar
          avatarUrl={picture?.toString()}
          colorId={id}
          placeholder={name}
          type="squared"
          size={14}
        />
      )}
      <StyledName>{name}</StyledName>
    </ContainerComponent>
  );
}

export default CompanyChip;
