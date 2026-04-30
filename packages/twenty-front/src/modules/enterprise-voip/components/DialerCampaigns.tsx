import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { GET_CALL_ANALYTICS } from '../hooks/useVoIP';

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

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
  align-self: flex-start;
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledConnectRate = styled.span<{ rate: number }>`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${({ rate }) =>
    rate > 60 ? themeCssVariables.color.turquoise
    : rate > 40 ? themeCssVariables.color.yellow
    : themeCssVariables.color.red};
`;

const StyledBar = styled.div`
  height: 6px;
  border-radius: 3px;
  background: ${themeCssVariables.background.transparent.medium};
  overflow: hidden;
`;

const StyledBarFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => percent}%;
  background: ${themeCssVariables.color.blue};
  border-radius: 3px;
`;

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const DialerCampaigns = () => {
  useLingui();

  const { data, loading, error } = useQuery(GET_CALL_ANALYTICS);

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const analytics = data?.callAnalytics;
  const byDirection = analytics?.byDirection ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Dialer Campaigns`}</StyledTitle>
      <StyledGrid>
        {byDirection.map((directionData: {
          direction: string;
          count: number;
          averageDuration: number;
        }) => {
          const connectRate = analytics?.totalCalls > 0
            ? Math.round((analytics.answeredCalls / analytics.totalCalls) * 100)
            : 0;
          return (
            <StyledCard key={directionData.direction}>
              <StyledBadge color={themeCssVariables.color.turquoise}>
                {directionData.direction}
              </StyledBadge>
              <StyledName>{directionData.direction} {t`calls`}</StyledName>
              <StyledConnectRate rate={connectRate}>{connectRate}% {t`connect rate`}</StyledConnectRate>
              <StyledRow>
                <span>{t`Count`}: {directionData.count}</span>
                <span>{t`Avg Duration`}: {Math.floor((directionData.averageDuration ?? 0) / 60)}m</span>
              </StyledRow>
              <StyledBar>
                <StyledBarFill percent={connectRate} />
              </StyledBar>
            </StyledCard>
          );
        })}
      </StyledGrid>
    </StyledContainer>
  );
};
