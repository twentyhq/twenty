import {
  StyledSettingsCardContent,
  StyledSettingsCardThirdLine,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import { Card } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type MarketplaceApp } from '~/generated-metadata/graphql';

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
              avatarUrl={application.logo || null}
              placeholder={application.name}
              placeholderColorSeed={application.name}
              size="lg"
              type="squared"
            />
            <div>
              <StyledSettingsCardTitle>
                {application.name}
              </StyledSettingsCardTitle>
              <StyledDescription>{application.description}</StyledDescription>
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
