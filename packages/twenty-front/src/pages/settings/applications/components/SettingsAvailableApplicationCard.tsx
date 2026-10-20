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
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { type MarketplaceApp } from '~/generated-metadata/graphql';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SettingsAvailableApplicationCardProps = {
  application: MarketplaceApp;
};

const StyledApplicationCardContent = styled(StyledSettingsCardContent)`
  align-items: flex-start;
  height: 100%;
`;

const StyledTextColumn = styled.div`
  min-width: 0;
`;

const StyledTitle = styled(StyledSettingsCardTitle)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledAuthor = styled(StyledSettingsCardThirdLine)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  overflow-wrap: anywhere;
`;

export const SettingsAvailableApplicationCard = ({
  application,
}: SettingsAvailableApplicationCardProps) => {
  const descriptionSummary = getApplicationDescriptionSummary(
    application.description,
  );
  const author = application.author;

  return (
    <Card.Root
      fullWidth
      render={
        <Link
          to={getSettingsPath(SettingsPath.AvailableApplicationDetail, {
            availableApplicationId: application.id,
          })}
        />
      }
    >
      <StyledApplicationCardContent>
        <Avatar
          src={getAbsoluteImageUrl(application.logoUrl || null)}
          name={application.name}
          colorSeed={application.name}
          size="lg"
          shape="square"
        />
        <StyledTextColumn>
          <StyledTitle title={application.name}>{application.name}</StyledTitle>
          <StyledDescription>{descriptionSummary}</StyledDescription>
          {isNonEmptyString(author) && (
            <StyledAuthor>{t`by ${author}`}</StyledAuthor>
          )}
        </StyledTextColumn>
      </StyledApplicationCardContent>
    </Card.Root>
  );
};
