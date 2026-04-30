import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { EngagementScoreData } from '../types/personalization.types';

const TREND_COLORS: Record<string, string> = {
  rising: themeCssVariables.color.green,
  stable: themeCssVariables.color.blue,
  declining: themeCssVariables.color.red,
};

const MOCK_SCORES: EngagementScoreData[] = [
  { id: 'ES-1', contactName: 'Carlos Mendez', email: 'carlos@acme.com', score: 92, trend: 'rising', lastActivity: '2026-04-28', topChannel: 'Email' },
  { id: 'ES-2', contactName: 'Sofia Garcia', email: 'sofia@beta.com', score: 78, trend: 'stable', lastActivity: '2026-04-27', topChannel: 'In-app' },
  { id: 'ES-3', contactName: 'Pedro Ruiz', email: 'pedro@gamma.com', score: 45, trend: 'declining', lastActivity: '2026-04-15', topChannel: 'Social' },
  { id: 'ES-4', contactName: 'Laura Diaz', email: 'laura@delta.com', score: 83, trend: 'rising', lastActivity: '2026-04-28', topChannel: 'Email' },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledTrend = styled.span<{ color: string }>`
  color: ${({ color }) => color};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledResponsiveHide = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledResponsiveHideHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

export const EngagementScores = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Engagement Scores`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Contact`}</StyledTh>
            <StyledTh>{t`Score`}</StyledTh>
            <StyledTh>{t`Trend`}</StyledTh>
            <StyledResponsiveHideHeader>{t`Channel`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Last Activity`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_SCORES.map((score) => (
            <tr key={score.id}>
              <StyledTd>{score.contactName}</StyledTd>
              <StyledTd>{score.score}</StyledTd>
              <StyledTd>
                <StyledTrend color={TREND_COLORS[score.trend]}>{score.trend}</StyledTrend>
              </StyledTd>
              <StyledResponsiveHide>{score.topChannel}</StyledResponsiveHide>
              <StyledResponsiveHide>{score.lastActivity}</StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
