import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { EventROIData } from '../types/events.types';

const MOCK_ROI: EventROIData[] = [
  { eventId: 'EV3', eventName: 'Partner Workshop Q1', totalCost: 12000000, leadsGenerated: 28, pipelineInfluenced: 450000000, dealsWon: 3, revenueAttributed: 85000000, roi: 608, currency: 'COP' },
  { eventId: 'EV-OLD1', eventName: 'CRM Summit 2025', totalCost: 80000000, leadsGenerated: 150, pipelineInfluenced: 2000000000, dealsWon: 12, revenueAttributed: 320000000, roi: 300, currency: 'COP' },
  { eventId: 'EV-OLD2', eventName: 'Webinar Series Feb', totalCost: 3000000, leadsGenerated: 65, pipelineInfluenced: 180000000, dealsWon: 5, revenueAttributed: 42000000, roi: 1300, currency: 'COP' },
];

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

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledROI = styled.span<{ value: number }>`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${({ value }) =>
    value > 500 ? themeCssVariables.color.turquoise
    : value > 200 ? themeCssVariables.color.blue
    : themeCssVariables.color.orange};
`;

export const EventROI = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Event ROI`}</StyledTitle>
      <StyledGrid>
        {MOCK_ROI.map((event) => (
          <StyledCard key={event.eventId}>
            <StyledName>{event.eventName}</StyledName>
            <StyledROI value={event.roi}>{event.roi}% ROI</StyledROI>
            <StyledRow>
              <span>{t`Cost`}</span>
              <span>${event.totalCost.toLocaleString()}</span>
            </StyledRow>
            <StyledRow>
              <span>{t`Revenue`}</span>
              <span>${event.revenueAttributed.toLocaleString()}</span>
            </StyledRow>
            <StyledRow>
              <span>{t`Leads`}</span>
              <span>{event.leadsGenerated}</span>
            </StyledRow>
            <StyledRow>
              <span>{t`Deals Won`}</span>
              <span>{event.dealsWon}</span>
            </StyledRow>
            <StyledRow>
              <span>{t`Pipeline`}</span>
              <span>${event.pipelineInfluenced.toLocaleString()}</span>
            </StyledRow>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
