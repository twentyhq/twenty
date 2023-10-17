import styled from '@emotion/styled';

import CoverImage from '../assets/build-your-business-logic.jpg';

const StyledCoverImageContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 153px;
  width: 100%;
`;

const StyledCoverImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

export const SettingsObjectCoverImage = () => {
  return (
    <StyledCoverImageContainer>
      <StyledCoverImage src={CoverImage} alt="Build your business logic" />
    </StyledCoverImageContainer>
  );
};
