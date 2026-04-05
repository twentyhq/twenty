import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { type IconComponent } from 'twenty-ui/display';

type DataValidatorTopicCardProps = {
  title: string;
  description: string;
  Icon?: IconComponent;
  to?: string;
  totalCount?: number;
  reviewedCount?: number;
  progressPercent?: number;
  loading?: boolean;
  comingSoon?: boolean;
};

const StyledCard = styled.div<{ $comingSoon?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(6)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ theme }) => theme.background.primary};
  cursor: ${({ $comingSoon }) => ($comingSoon ? 'default' : 'pointer')};
  opacity: ${({ $comingSoon }) => ($comingSoon ? 0.5 : 1)};
  transition: box-shadow 200ms ease;

  &:hover {
    box-shadow: ${({ $comingSoon }) =>
      $comingSoon ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.08)'};
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
`;

const StyledDescription = styled.p`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  margin: 0;
  line-height: 1.5;
`;

const StyledProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledProgressBarTrack = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 2px;
  overflow: hidden;
`;

const StyledProgressBarFill = styled.div<{ $percent: number }>`
  width: ${({ $percent }) => $percent}%;
  height: 100%;
  background: #22c55e;
  border-radius: 2px;
  transition: width 300ms ease;
`;

const StyledProgressText = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledPill = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
  background: ${({ theme }) => theme.background.secondary};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const DataValidatorTopicCard = ({
  title,
  description,
  Icon,
  to,
  totalCount,
  reviewedCount,
  progressPercent,
  loading,
  comingSoon,
}: DataValidatorTopicCardProps) => {
  const cardContent = (
    <StyledCard $comingSoon={comingSoon}>
      <StyledHeader>
        {Icon && <Icon size={20} />}
        <StyledTitle>{title}</StyledTitle>
        {comingSoon && <StyledPill>Coming Soon</StyledPill>}
      </StyledHeader>
      <StyledDescription>{description}</StyledDescription>
      {!comingSoon && (
        <StyledProgressContainer>
          <StyledProgressBarTrack>
            <StyledProgressBarFill $percent={progressPercent ?? 0} />
          </StyledProgressBarTrack>
          <StyledProgressText>
            {loading
              ? 'Loading...'
              : `${reviewedCount ?? 0} / ${totalCount ?? 0} reviewed (${progressPercent ?? 0}%)`}
          </StyledProgressText>
        </StyledProgressContainer>
      )}
    </StyledCard>
  );

  if (comingSoon || !to) {
    return cardContent;
  }

  return <StyledLink to={to}>{cardContent}</StyledLink>;
};
