import styled from '@emotion/styled';

import { ApiKeyForm } from '@/api-key/components/ApiKeyForm';

const StyledContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
`;

const Options = () => {
  return (
    <StyledContainer>
      <ApiKeyForm />
    </StyledContainer>
  );
};

export default Options;
