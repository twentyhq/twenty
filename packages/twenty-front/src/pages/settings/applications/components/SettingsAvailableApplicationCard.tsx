import {
  StyledSettingsCardContent,
  StyledSettingsCardTextContainer,
  StyledSettingsCardThirdLine,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconCheck } from 'twenty-ui/icon';
import { AppTooltip, Card, TooltipDelay } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { type MarketplaceApp } from '~/generated-metadata/graphql';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SettingsAvailableApplicationCardProps = {
  application: MarketplaceApp;
  installedApplicationId?: string;
};

const StyledLinkContainer = styled.div`
  > a {
    display: flex;
    height: 100%;
    text-decoration: none;
  }
`;

const StyledDescription = styled.div`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${themeCssVariables.font.color.secondary};
  display: -webkit-box;

  a {
    pointer-events: auto;
    position: relative;
    z-index: 1;
  }

  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  overflow: hidden;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledInstalledIconContainer = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

export const SettingsAvailableApplicationCard = ({
  application,
  installedApplicationId,
}: SettingsAvailableApplicationCardProps) => {
  const { theme } = useContext(ThemeContext);

  const isInstalled = isDefined(installedApplicationId);

  const descriptionSummary = getApplicationDescriptionSummary(
    application.description,
  );

  const linkPath = isInstalled
    ? getSettingsPath(SettingsPath.ApplicationDetail, {
        applicationId: installedApplicationId,
      })
    : getSettingsPath(SettingsPath.AvailableApplicationDetail, {
        availableApplicationId: application.id,
      });

  return (
    <StyledLinkContainer>
      <Link to={linkPath}>
        <Card rounded fullWidth>
          <StyledSettingsCardContent alignItems="flex-start" fullHeight>
            <Avatar
              avatarUrl={getAbsoluteImageUrl(application.logo || null)}
              placeholder={application.name}
              placeholderColorSeed={application.name}
              size="lg"
              type="squared"
            />
            <StyledSettingsCardTextContainer>
              <StyledTitleRow>
                <StyledSettingsCardTitle>
                  {application.name}
                </StyledSettingsCardTitle>
                {isInstalled && (
                  <StyledInstalledIconContainer
                    data-tooltip-id={`installed-indicator-${application.id}`}
                  >
                    <IconCheck
                      size={theme.icon.size.sm}
                      stroke={theme.icon.stroke.md}
                      color={theme.color.green}
                    />
                  </StyledInstalledIconContainer>
                )}
              </StyledTitleRow>
              <StyledDescription>{descriptionSummary}</StyledDescription>
              <StyledSettingsCardThirdLine>
                {t`by {author}`} {application.author}
              </StyledSettingsCardThirdLine>
            </StyledSettingsCardTextContainer>
          </StyledSettingsCardContent>
        </Card>
      </Link>
      {isInstalled && (
        <AppTooltip
          anchorSelect={`[data-tooltip-id='installed-indicator-${application.id}']`}
          content={t`Installed`}
          delay={TooltipDelay.shortDelay}
          noArrow
          place="top"
          positionStrategy="fixed"
        />
      )}
    </StyledLinkContainer>
  );
};
