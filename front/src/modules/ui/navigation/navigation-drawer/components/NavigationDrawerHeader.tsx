import styled from '@emotion/styled';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { NavigationDrawerCollapseButton } from './NavigationDrawerCollapseButton';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(1)};
  user-select: none;
`;

const StyledLogo = styled.div<{ logo: string }>`
  background: url(${({ logo }) => logo});
  background-position: center;
  background-size: cover;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: 16px;
  width: 16px;
`;

const StyledName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-family: 'Inter';
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledNavigationDrawerCollapseButton = styled(
  NavigationDrawerCollapseButton,
)<{ show?: boolean }>`
  margin-left: auto;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity ${({ theme }) => theme.animation.duration.normal}s;
`;

type NavigationDrawerHeaderProps = {
  name?: string;
  logo?: string;
  showCollapseButton: boolean;
};

export const NavigationDrawerHeader = ({
  name = 'Twenty',
  logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAACb0lEQVR4nO2VO4taQRTHr3AblbjxEVlwCwVhg7BoqqCIjy/gAyyFWNlYBOxsfH0KuxgQGwXRUkGuL2S7i1barGAgiwbdW93SnGOc4BonPiKahf3DwXFmuP/fPM4ZlvmlTxAhCBdzHnEQWYiv7Mr4C3NeuVYhQYDPzOUUQgDLBQGcLHNhvQK8DACPx8PTxiqVyvISG43GbyaT6Qfpn06n0m63e/tPAPF4vJ1MJu8kEsnWTCkWi1yr1RKGw+GDRqPBOTfr44vFQvD7/Q/lcpmaaVQAr9fLp1IpO22c47hGOBz+MB6PH+Vy+VYDAL8qlUoGtVotzOfzq4MAgsHgE/6KojiQyWR/bKVSqbSszHFM8Pl8z1YK48JsNltCOBwOnrYLO+8AAIjb+nHbycoTiUQfDJ7tFq4YAHiVSmXBxcD41u8flQU8z7fhzO0r83atVns3Go3u9Xr9x0O/RQXo9/tsIBBg6vX606a52Wz+bZ7P5/WwG29gxSJzhKgA6XTaDoFNF+krFAocmC//4yWEcSf2wTm7mCO19xFgSsKOLI16vV7b7XY7mRNoLwA0JymJ5uQIzgIAuX5PzDElT2m+E8BqtQ4ymcx7Yq7T6a6ZE4sKgOadTucaCwkxp1UzlEKh0GDxIXOwDWHAdi6Xe3swQDQa/Q7mywoolUpvsaptymazDWKxmBHTlWXZm405BFZoNpuGgwEmk4mE2SGtVivii4f1AO7J3ZopkQCQj7Ar1FeRChCJRJzVapX6DKNIfSc1Ax+wtQWQ55h6bH8FWDfYV4fO3wlwDr0C/BcADYiTPCxHqIEA2QsCZAkAKnRGkMbKN/sTX5YHPQ1e7SkAAAAASUVORK5CYII=',
  showCollapseButton,
}: NavigationDrawerHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <StyledContainer>
      <StyledLogo logo={logo} />
      <StyledName>{name}</StyledName>
      {!isMobile && (
        <StyledNavigationDrawerCollapseButton
          direction="left"
          show={showCollapseButton}
        />
      )}
    </StyledContainer>
  );
};
