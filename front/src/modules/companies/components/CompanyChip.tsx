import styled from '@emotion/styled';

import { Avatar } from '@/users/components/Avatar';

export type CompanyChipPropsType = {
  name: string;
  picture?: string;
};

const StyledContainer = styled.span`
  align-items: center;
  background-color: ${(props) => props.theme.tertiaryBackground};
  border-radius: ${(props) => props.theme.spacing(1)};
  color: ${(props) => props.theme.text80};
  display: inline-flex;
  gap: ${(props) => props.theme.spacing(1)};
  padding: ${(props) => props.theme.spacing(1)};

  :hover {
    filter: brightness(95%);
  }

  img {
    height: 14px;
    object-fit: cover;
    width: 14px;
  }
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
      {name}
    </StyledContainer>
  );
}

export default CompanyChip;
