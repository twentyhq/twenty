import styled from '@emotion/styled';

import { MainButton } from '@/ui/input/button/MainButton';

const StyledWrapper = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  height: 100vh;
  justify-content: center;
`;

const StyledContainer = styled.div`
  width: 400px;
  height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

const StyledLargeText = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledMediumText = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const PageInaccessible = () => {
  return (
    <StyledWrapper>
      <StyledContainer>
        <img src="/logo/32-32.svg" alt="twenty-logo" height={40} width={40} />
        <StyledTextContainer>
          <StyledLargeText>
            Extension not available on the website
          </StyledLargeText>
          <StyledMediumText>
            Open LinkedIn to use the extension
          </StyledMediumText>
        </StyledTextContainer>
        <MainButton
          title="Go to LinkedIn"
          onClick={() => window.open('https://www.linkedin.com/')}
        />
      </StyledContainer>
    </StyledWrapper>
  );
};

export default PageInaccessible;
