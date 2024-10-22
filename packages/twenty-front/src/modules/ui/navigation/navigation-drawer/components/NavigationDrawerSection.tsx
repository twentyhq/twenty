import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
  width: 100%;
  margin-bottom: ${({ theme }) => (useIsMobile() ? '' : theme.spacing(3))};
  flex-shrink: 1;
  overflow: hidden;
`;

export { StyledSection as NavigationDrawerSection };
