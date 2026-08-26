import {
  StyledSettingsCardContent,
  StyledSettingsCardThirdLine,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Avatar, Tag } from 'twenty-ui/data-display';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type MarketplaceApp } from '~/generated-metadata/graphql';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SettingsAvailableApplicationCardProps = {
  application: MarketplaceApp;
};

const StyledLinkContainer = styled.div`
  > a {
    display: flex;
    height: 100%;
    text-decoration: none;
  }
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
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

export const SettingsAvailableApplicationCard = ({
  application,
}: SettingsAvailableApplicationCardProps) => {
  const descriptionSummary = getApplicationDescriptionSummary(
    application.description,
  );

  const incompatibleTagText = isNonEmptyString(
    application.requiredServerVersionRange,
  )
    ? t`Requires Twenty ${application.requiredServerVersionRange}`
    : t`Incompatible version`;

  return (
    <StyledLinkContainer>
      <Link
        to={getSettingsPath(SettingsPath.AvailableApplicationDetail, {
          availableApplicationId: application.id,
        })}
      >
        <Card rounded fullWidth>
          <StyledSettingsCardContent alignItems="flex-start" fullHeight>
            <Avatar
              avatarUrl={getAbsoluteImageUrl(application.logoUrl || null)}
              placeholder={application.name}
              placeholderColorSeed={application.name}
              size="lg"
              type="squared"
            />
            <div>
              <StyledTitleRow>
                <StyledSettingsCardTitle>
                  {application.name}
                </StyledSettingsCardTitle>
                {!application.isServerVersionCompatible && (
                  <Tag color="orange" text={incompatibleTagText} />
                )}
              </StyledTitleRow>
              <StyledDescription>{descriptionSummary}</StyledDescription>
              <StyledSettingsCardThirdLine>
                {t`by {author}`} {application.author}
              </StyledSettingsCardThirdLine>
            </div>
          </StyledSettingsCardContent>
        </Card>
      </Link>
    </StyledLinkContainer>
  );
};
