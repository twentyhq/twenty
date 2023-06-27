import styled from '@emotion/styled';

import { Avatar } from '@/users/components/Avatar';

export type CompanyChipPropsType = {
  name: string;
  picture?: string;
};

const StyledContainer = styled.span`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: calc(20px - 2 * ${({ theme }) => theme.spacing(1)});
  overflow: hidden;

  padding: ${({ theme }) => theme.spacing(1)};

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

function CompanyChip({ name, picture }: CompanyChipPropsType) {
  return (
    <StyledContainer data-testid="company-chip">
      {picture && (
        <Avatar
          avatarUrl={picture?.toString()}
          placeholder={name}
          type="squared"
          size={14}
        />
      )}
      <StyledName>{name}</StyledName>
    </StyledContainer>
  );
}

export default CompanyChip;
