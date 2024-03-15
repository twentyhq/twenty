import styled from '@emotion/styled';

import Options from '~/options/Options';

const StyledContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: column;
  height: 100vh;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

const Loading = () => {
  return (
    <StyledContainer>
      <Options />
    </StyledContainer>
  );
};

export default Loading;
