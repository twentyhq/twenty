import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const BADGE_ASSET_PATH = '/images/onboarding/trust-badges';

const TRUSTED_BY_LOGOS = [
  { name: 'Bayer', src: `${BADGE_ASSET_PATH}/bayer.png` },
  { name: 'PwC', src: `${BADGE_ASSET_PATH}/pwc.png` },
  {
    name: 'République Française',
    src: `${BADGE_ASSET_PATH}/french-republic.png`,
  },
];

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
`;

const StyledBadge = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[7]};
  padding: 0 ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[1]};
`;

const StyledSeal = styled.img`
  height: 20px;
  object-fit: contain;
  width: 20px;
`;

const StyledLogoCluster = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledClusterLogo = styled.img`
  height: 18px;
  object-fit: contain;
  width: auto;
`;

const StyledBadgeLabel = styled.span`
  white-space: nowrap;
`;

type TrustBadgeProps = {
  label: string;
  leading: ReactNode;
};

const TrustBadge = ({ label, leading }: TrustBadgeProps) => (
  <StyledBadge>
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
