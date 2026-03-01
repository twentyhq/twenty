import styled from '@emotion/styled';
import { BORDER_COMMON, MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  gap: 8px;
  min-height: 0;
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: 12px;
  }
`;

const StyledPanel = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${BORDER_COMMON.radius.md};
  height: 100%;
  overflow: auto;
  width: 100%;
`;

export const ContentAreaSkeletonLoader = () => (
  <StyledContainer>
    <StyledPanel />
  </StyledContainer>
);
