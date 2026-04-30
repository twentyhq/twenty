import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ContentRecommendationData } from '../types/personalization.types';

const MOCK_RECOMMENDATIONS: ContentRecommendationData[] = [
  { id: 'CR-1', title: 'ROI Calculator Guide', contentType: 'whitepaper', relevanceScore: 95, targetSegment: 'Enterprise', views: 1200, conversions: 85 },
  { id: 'CR-2', title: 'Customer Success Story: Acme', contentType: 'case_study', relevanceScore: 88, targetSegment: 'Mid-Market', views: 890, conversions: 62 },
  { id: 'CR-3', title: 'Getting Started Tutorial', contentType: 'video', relevanceScore: 82, targetSegment: 'All', views: 3400, conversions: 210 },
  { id: 'CR-4', title: 'Advanced Automation Tips', contentType: 'article', relevanceScore: 76, targetSegment: 'Power Users', views: 560, conversions: 34 },
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

const StyledBadge = styled.span`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${themeCssVariables.background.transparent.lighter};
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
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

export const ContentRecommendations = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Content Recommendations`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Content`}</StyledTh>
            <StyledTh>{t`Type`}</StyledTh>
            <StyledTh>{t`Relevance`}</StyledTh>
            <StyledResponsiveHideHeader>{t`Views`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Conversions`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_RECOMMENDATIONS.map((rec) => (
            <tr key={rec.id}>
              <StyledTd>{rec.title}</StyledTd>
              <StyledTd><StyledBadge>{rec.contentType.replace('_', ' ')}</StyledBadge></StyledTd>
              <StyledTd>{rec.relevanceScore}%</StyledTd>
              <StyledResponsiveHide>{rec.views.toLocaleString()}</StyledResponsiveHide>
              <StyledResponsiveHide>{rec.conversions}</StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
