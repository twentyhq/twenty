import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const BADGE_ASSET_PATH = '/images/onboarding/trust-badges';

const TRUSTED_BY_LOGOS = [
  { name: 'PwC', src: `${BADGE_ASSET_PATH}/pwc.png` },
  {
    name: 'République Française',
    src: `${BADGE_ASSET_PATH}/french-republic.png`,
  },
];

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  max-width: 100%;
`;

const StyledBadge = styled.div<{ hasClusterLeading: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.light};
  corner-shape: round;
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[7]};
  overflow: hidden;
  padding: 0 10px 0
    ${({ hasClusterLeading }) =>
      hasClusterLeading ? '10px' : themeCssVariables.spacing[1]};
`;

const StyledSeal = styled.img`
  height: 21px;
  object-fit: contain;
  width: 21px;
`;

const StyledLogoCluster = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledClusterLogo = styled.img`
  height: ${themeCssVariables.spacing[6]};
  object-fit: contain;
  width: ${themeCssVariables.spacing[6]};
`;

const StyledBadgeLabel = styled.span`
  white-space: nowrap;
`;

type TrustBadgeProps = {
  hasClusterLeading?: boolean;
  label: string;
  leading: ReactNode;
};

const TrustBadge = ({
  hasClusterLeading = false,
  label,
  leading,
}: TrustBadgeProps) => (
  <StyledBadge hasClusterLeading={hasClusterLeading}>
    {leading}
    <StyledBadgeLabel>{label}</StyledBadgeLabel>
  </StyledBadge>
);

export const OnboardingTrustBadges = () => (
  <StyledRow>
    <TrustBadge
      label="SOC2"
      leading={<StyledSeal src={`${BADGE_ASSET_PATH}/soc2.png`} alt="" />}
    />
    <TrustBadge
      label="+10k"
      hasClusterLeading
      leading={
        <StyledLogoCluster>
          {TRUSTED_BY_LOGOS.map((logo) => (
            <StyledClusterLogo key={logo.name} src={logo.src} alt={logo.name} />
          ))}
        </StyledLogoCluster>
      }
    />
    <TrustBadge
      label="GDPR"
      leading={<StyledSeal src={`${BADGE_ASSET_PATH}/gdpr.png`} alt="" />}
    />
  </StyledRow>
);
