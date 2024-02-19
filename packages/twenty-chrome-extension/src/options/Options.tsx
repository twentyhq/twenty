import styled from '@emotion/styled';
import { ApiKeyForm } from './modules/api-key/components/ApiKeyForm';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Options = () => {
  return (
    <StyledContainer>
      <ApiKeyForm />
    </StyledContainer>
  );
};

export default Options;
