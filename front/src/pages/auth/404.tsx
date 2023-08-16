import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { Button, ButtonVariant } from '@/ui/button/components/Button';

import { CompaniesMockMode } from '../companies/CompaniesMockMode';

const Overlay = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.secondary};
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  width: 100vw;
  z-index: 9999;
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(16)};
  justify-content: center;
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.grayScale.gray60};
`;

const StyledSubtitle = styled.div`
  color: ${({ theme }) => theme.grayScale.gray30};
`;

const StyledButton = styled(Button)`
  background: ${({ theme }) => theme.grayScale.gray100};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding-left: ${({ theme }) => theme.spacing(8)};
  padding-right: ${({ theme }) => theme.spacing(8)};

  &:hover {
    background: ${({ theme }) => theme.grayScale.gray100};
  }
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  font-size: 56px;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  gap: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

export function NotFoundPage() {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <>
      <CompaniesMockMode />
      <Overlay>
        <StyledContainer>
          <StyledTitleContainer>
            <StyledTitle>404</StyledTitle>
            <StyledSubtitle>Page Not Found</StyledSubtitle>
          </StyledTitleContainer>
          <StyledButton
            variant={ButtonVariant.Primary}
            onClick={handleBackClick}
            title="Back to Content"
          />
        </StyledContainer>
      </Overlay>
    </>
  );
}
