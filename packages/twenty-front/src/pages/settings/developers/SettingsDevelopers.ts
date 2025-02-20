import styled from '@emotion/styled';
import { MOBILE_VIEWPORT } from 'twenty-ui';

export const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-top: ${({ theme }) => theme.spacing(5)};
  }
`;

export const StyledContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const FormContainer = styled.section`
  display: flex;
  flex-direction: row;
  gap: 20px; 
  margin-bottom: 40px; 
  align-items: end;
  margin-top: 20px;
`;

