import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import { Card, CardContent } from 'twenty-ui/layout';
import { type AvailableApplication } from '~/pages/settings/applications/types/availableApplication';

type SettingsAvailableApplicationCardProps = {
  application: AvailableApplication;
};

const StyledCardContent = styled(CardContent)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

const StyledName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledDescription = styled.div`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${({ theme }) => theme.font.color.secondary};
  display: -webkit-box;
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.5;
  min-height: calc(${({ theme }) => theme.font.size.sm} * 1.5 * 2);
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledAuthor = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

export const SettingsAvailableApplicationCard = ({
  application,
}: SettingsAvailableApplicationCardProps) => {
  return (
    <Link
      to={getSettingsPath(SettingsPath.AvailableApplicationDetail, {
        availableApplicationId: application.id,
      })}
      style={{ textDecoration: 'none' }}
    >
      <Card rounded fullWidth>
        <StyledCardContent>
          <Avatar
            avatarUrl={application.logoPath || null}
            placeholder={application.name}
            placeholderColorSeed={application.name}
            size="lg"
            type="squared"
          />
          <StyledInfo>
            <StyledName>{application.name}</StyledName>
            <StyledDescription>{application.description}</StyledDescription>
            <StyledAuthor>by {application.author}</StyledAuthor>
          </StyledInfo>
        </StyledCardContent>
      </Card>
    </Link>
  );
};
