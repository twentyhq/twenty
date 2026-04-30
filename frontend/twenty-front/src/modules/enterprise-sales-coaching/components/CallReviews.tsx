import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { CallReviewData } from '../types/coaching.types';

const MOCK_REVIEWS: CallReviewData[] = [
  { id: 'CR-1', repName: 'Juan Perez', callDate: '2026-04-27', prospect: 'Acme Corp', duration: 32, overallScore: 85, talkRatio: 42, questionCount: 12, sentiment: 'positive' },
  { id: 'CR-2', repName: 'Luis Reyes', callDate: '2026-04-26', prospect: 'Beta Inc', duration: 28, overallScore: 72, talkRatio: 55, questionCount: 8, sentiment: 'neutral' },
  { id: 'CR-3', repName: 'Pedro Ruiz', callDate: '2026-04-25', prospect: 'Gamma Ltd', duration: 45, overallScore: 60, talkRatio: 68, questionCount: 5, sentiment: 'negative' },
  { id: 'CR-4', repName: 'Juan Perez', callDate: '2026-04-24', prospect: 'Delta SA', duration: 35, overallScore: 91, talkRatio: 38, questionCount: 15, sentiment: 'positive' },
];

const SENTIMENT_COLORS: Record<string, string> = {
  positive: themeCssVariables.color.green,
  neutral: themeCssVariables.color.yellow,
  negative: themeCssVariables.color.red,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StyledRepName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledScoreBadge = styled.span<{ isHigh: boolean }>`
  padding: 4px 12px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  background: ${({ isHigh }) =>
    isHigh ? themeCssVariables.color.green : themeCssVariables.color.orange};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledMetaRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  flex-wrap: wrap;
`;

const StyledMetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledMetaLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
`;

const StyledMetaValue = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledDot = styled.span<{ color: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
  margin-right: 4px;
`;

export const CallReviews = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Call Reviews`}</StyledTitle>
      {MOCK_REVIEWS.map((review) => (
        <StyledCard key={review.id}>
          <StyledCardHeader>
            <StyledRepName>{review.repName} &rarr; {review.prospect}</StyledRepName>
            <StyledScoreBadge isHigh={review.overallScore >= 80}>{review.overallScore}/100</StyledScoreBadge>
          </StyledCardHeader>
          <StyledMetaRow>
            <StyledMetaItem>
              <StyledMetaLabel>{t`Duration`}</StyledMetaLabel>
              <StyledMetaValue>{review.duration} min</StyledMetaValue>
            </StyledMetaItem>
            <StyledMetaItem>
              <StyledMetaLabel>{t`Talk Ratio`}</StyledMetaLabel>
              <StyledMetaValue>{review.talkRatio}%</StyledMetaValue>
            </StyledMetaItem>
            <StyledMetaItem>
              <StyledMetaLabel>{t`Questions`}</StyledMetaLabel>
              <StyledMetaValue>{review.questionCount}</StyledMetaValue>
            </StyledMetaItem>
            <StyledMetaItem>
              <StyledMetaLabel>{t`Sentiment`}</StyledMetaLabel>
              <StyledMetaValue>
                <StyledDot color={SENTIMENT_COLORS[review.sentiment]} />
                {review.sentiment}
              </StyledMetaValue>
            </StyledMetaItem>
          </StyledMetaRow>
        </StyledCard>
      ))}
    </StyledContainer>
  );
};
