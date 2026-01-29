import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Card, CardContent } from 'twenty-ui/layout';
import { type AvailableApplication } from '~/pages/settings/applications/types/availableApplication';

type SettingsAvailableApplicationCardProps = {
  application: AvailableApplication;
};

const StyledCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  cursor: pointer;
  width: 100%;

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledCardContent = styled(CardContent)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledLogo = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  overflow: hidden;
  width: 40px;
`;

const StyledLogoImage = styled.img`
  height: 24px;
  object-fit: contain;
  width: 24px;
`;

const StyledLogoPlaceholder = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ theme }) => theme.font.color.inverted};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 24px;
  justify-content: center;
  width: 24px;
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
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <Link
      to={getSettingsPath(SettingsPath.AvailableApplicationDetail, {
        availableApplicationId: application.id,
      })}
      style={{ textDecoration: 'none' }}
    >
      <StyledCard rounded>
        <StyledCardContent>
          <StyledLogo>
            {application.logoPath ? (
              <StyledLogoImage
                src={application.logoPath}
                alt={application.name}
              />
            ) : (
              <StyledLogoPlaceholder>
                {getInitials(application.name)}
              </StyledLogoPlaceholder>
            )}
          </StyledLogo>
          <StyledInfo>
            <StyledName>{application.name}</StyledName>
            <StyledDescription>{application.description}</StyledDescription>
            <StyledAuthor>by {application.author}</StyledAuthor>
          </StyledInfo>
        </StyledCardContent>
      </StyledCard>
    </Link>
  );
};
