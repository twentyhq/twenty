import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { MainButton } from '@/ui/button/components/MainButton';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { CompaniesMockMode } from './pages/companies/CompaniesMockMode';

const StyledBackDrop = styled.div`
  align-items: center;
  backdrop-filter: ${({ theme }) => theme.blur.light};
  background: ${({ theme }) => theme.background.transparent.secondary};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10000;
`;

const StyledTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(15)};
`;

const StyledButtonContainer = styled.div`
  width: 200px;
`;

type StyledInfoProps = {
  color: 'dark' | 'light';
};

const StyledInfo = styled.div<StyledInfoProps>`
  color: ${(props) =>
    props.color === 'light'
      ? props.theme.font.color.extraLight
      : props.theme.font.color.primary};
  font-size: ${() => (useIsMobile() ? '2.5rem' : '4rem')};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <StyledBackDrop>
        <StyledTextContainer>
          <StyledInfo color="dark">404</StyledInfo>
          <StyledInfo color="light">Page not found</StyledInfo>
        </StyledTextContainer>
        <StyledButtonContainer>
          <MainButton
            title="Back to content"
            fullWidth
            onClick={() => navigate('/')}
          />
        </StyledButtonContainer>
      </StyledBackDrop>
      <CompaniesMockMode />
    </>
  );
}
