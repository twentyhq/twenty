import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { DealData, DealStage } from '../types/sales.types';
import { GET_SALES_EXECUTION_DATA } from '../hooks/useSalesExecution';

const STAGE_ORDER: DealStage[] = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
const STAGE_LABELS: Record<DealStage, string> = { prospecting: 'Prospecting', qualification: 'Qualification', proposal: 'Proposal', negotiation: 'Negotiation', closed_won: 'Closed Won', closed_lost: 'Closed Lost' };

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledBoard = styled.div` display: flex; gap: ${themeCssVariables.spacing[3]}; overflow-x: auto; @media (max-width: ${MOBILE_VIEWPORT}px) { flex-direction: column; } `;
const StyledColumn = styled.div` min-width: 200px; flex: 1; display: flex; flex-direction: column; gap: ${themeCssVariables.spacing[2]}; `;
const StyledColumnHeader = styled.div` font-size: ${themeCssVariables.font.size.sm}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.tertiary}; text-transform: uppercase; padding-bottom: ${themeCssVariables.spacing[1]}; border-bottom: 2px solid ${themeCssVariables.border.color.medium}; `;
const StyledCard = styled.div` padding: ${themeCssVariables.spacing[3]}; border: 1px solid ${themeCssVariables.border.color.light}; border-radius: 8px; background: ${themeCssVariables.background.transparent.lighter}; display: flex; flex-direction: column; gap: 4px; `;
const StyledDealName = styled.span` font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const StyledDealMeta = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; `;

export const PipelineBoard = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_SALES_EXECUTION_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const deals: DealData[] = data?.salesexecutionData?.deals ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Pipeline Board`}</StyledTitle>
      <StyledBoard>
        {STAGE_ORDER.map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stage === stage);
          return (
            <StyledColumn key={stage}>
              <StyledColumnHeader>{STAGE_LABELS[stage]} ({stageDeals.length})</StyledColumnHeader>
              {stageDeals.map((deal) => (
                <StyledCard key={deal.id}>
                  <StyledDealName>{deal.name}</StyledDealName>
                  <StyledDealMeta>{deal.account}</StyledDealMeta>
                  <StyledDealMeta>${deal.amount.toLocaleString()} &middot; {deal.probability}%</StyledDealMeta>
                </StyledCard>
              ))}
            </StyledColumn>
          );
        })}
      </StyledBoard>
    </StyledContainer>
  );
};
