import { GettingStartedAppInstallButton } from '@/getting-started/components/GettingStartedAppInstallButton';
import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { getApplicationDescriptionSummary } from '@/settings/applications/utils/getApplicationDescriptionSummary';
import { SettingsListSkeletonCard } from '@/settings/components/SettingsListSkeletonCard';
import { styled } from '@linaria/react';
import { GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledList = styled.ul`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  list-style: none;
  margin: 0;
  overflow: hidden;
  padding: 0;
`;

const StyledRow = styled.li`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[4]};

  & + & {
    border-top: 1px solid ${themeCssVariables.border.color.medium};
  }
`;

const StyledText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  line-height: ${themeCssVariables.text.lineHeight.lg};
  min-width: 0;
`;

const StyledName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GettingStartedAppsAction = () => {
  const { data: marketplaceApps, isLoading } = useMarketplaceApps();

  const featuredApps = GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS.map(
    (universalIdentifier) =>
      marketplaceApps.find(
        (marketplaceApp) =>
          marketplaceApp.id === universalIdentifier && marketplaceApp.isListed,
      ),
  ).filter(isDefined);

  if (isLoading) {
    return <SettingsListSkeletonCard />;
  }

  return (
    <StyledList>
      {featuredApps.map((featuredApp) => (
        <StyledRow key={featuredApp.id}>
          <Avatar
            src={getAbsoluteImageUrl(featuredApp.logoUrl || null) ?? null}
            name={featuredApp.name}
            colorSeed={featuredApp.name}
            size="lg"
            shape="square"
          />
          <StyledText>
            <StyledName>{featuredApp.name}</StyledName>
            <StyledDescription>
              {getApplicationDescriptionSummary(featuredApp.description)}
            </StyledDescription>
          </StyledText>
          <GettingStartedAppInstallButton item={featuredApp} />
        </StyledRow>
      ))}
    </StyledList>
  );
};
