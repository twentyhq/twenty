import { Loader } from '@/ui/display/loader/components/Loader';
import styled from '@emotion/styled';

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
      <img src="/logo/32-32.svg" alt="twenty-logo" height={64} width={64} />
      <Loader />
    </StyledContainer>
  );
};

export default Loading;
