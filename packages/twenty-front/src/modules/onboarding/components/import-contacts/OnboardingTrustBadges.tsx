import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { getLogoUrlFromDomainName } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconLock, IconShield } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const TRUSTED_BY_LOGO_DOMAINS = ['google.com', 'airbnb.com', 'notion.so'];

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

const StyledLogoCluster = styled.div`
  align-items: center;
  display: flex;

  & > * + * {
    margin-left: -${themeCssVariables.spacing[1]};
  }
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

export const OnboardingTrustBadges = () => {
  const theme = useTheme();

  return (
    <StyledRow>
      <TrustBadge
        label="SOC2"
        leading={
          <IconShield
            size={theme.icon.size.md}
            color={themeCssVariables.font.color.tertiary}
          />
        }
      />
      <TrustBadge
        label="+10k"
        leading={
          <StyledLogoCluster>
            {TRUSTED_BY_LOGO_DOMAINS.map((domainName) => (
              <Avatar
                key={domainName}
                type="rounded"
                size="md"
                placeholder={domainName}
                placeholderColorSeed={domainName}
                avatarUrl={getAbsoluteImageUrl(
                  getLogoUrlFromDomainName(domainName),
                )}
              />
            ))}
          </StyledLogoCluster>
        }
      />
      <TrustBadge
        label="GDPR"
        leading={
          <IconLock
            size={theme.icon.size.md}
            color={themeCssVariables.font.color.tertiary}
          />
        }
      />
    </StyledRow>
  );
};
