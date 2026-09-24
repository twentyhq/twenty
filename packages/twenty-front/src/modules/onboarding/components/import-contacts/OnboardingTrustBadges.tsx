import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const BADGE_ASSET_PATH = '/images/onboarding/trust-badges';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  max-width: 100%;
`;

const StyledBadge = styled.div`
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
  padding: 0 10px 0 ${themeCssVariables.spacing[1]};
`;

const StyledSeal = styled.img`
  height: 21px;
  object-fit: contain;
  width: 21px;
`;

const StyledBadgeLabel = styled.span`
  white-space: nowrap;
`;

type TrustBadgeProps = {
  label: string;
  sealSrc: string;
};

const TrustBadge = ({ label, sealSrc }: TrustBadgeProps) => (
  <StyledBadge>
    <StyledSeal src={sealSrc} alt="" />
    <StyledBadgeLabel>{label}</StyledBadgeLabel>
  </StyledBadge>
);

export const OnboardingTrustBadges = () => (
  <StyledRow>
    <TrustBadge label="SOC2" sealSrc={`${BADGE_ASSET_PATH}/soc2.png`} />
    <TrustBadge label="GDPR" sealSrc={`${BADGE_ASSET_PATH}/gdpr.png`} />
  </StyledRow>
);
