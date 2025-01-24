import styled from '@emotion/styled';
import { useIsMobile } from 'twenty-ui';

const StyledSection = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  flex-shrink: 1;
`;

const StyledSectionInnerContainerMinusScrollPadding = styled.div<{
  isMobile: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
  width: calc(
    100% - ${({ isMobile, theme }) => (isMobile ? 0 : theme.spacing(2))}
  );
`;

export const NavigationDrawerSection = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isMobile = useIsMobile();
  return (
    <StyledSection>
      <StyledSectionInnerContainerMinusScrollPadding isMobile={isMobile}>
        {children}
      </StyledSectionInnerContainerMinusScrollPadding>
    </StyledSection>
  );
};
