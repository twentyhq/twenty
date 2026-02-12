import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardThirdLine,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import { Card } from 'twenty-ui/layout';
import { type MarketplaceApp } from '~/generated-metadata/graphql';

type SettingsAvailableApplicationCardProps = {
  application: MarketplaceApp;
};

const StyledLink = styled(Link)`
  display: flex;
  height: 100%;
  text-decoration: none;
`;

const StyledDescription = styled(StyledSettingsCardDescription)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const SettingsAvailableApplicationCard = ({
  application,
}: SettingsAvailableApplicationCardProps) => {
  return (
    <StyledLink
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
    </StyledLink>
  );
};
