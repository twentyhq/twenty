import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PlaybookData } from '../types/cs.types';

const MOCK_PLAYBOOKS: PlaybookData[] = [
  { id: 'PB-1', name: 'Onboarding 90-day', accountName: 'Acme Corp', currentStep: 6, totalSteps: 8, status: 'active', startedAt: '2026-03-01' },
  { id: 'PB-2', name: 'At-Risk Recovery', accountName: 'Beta Inc', currentStep: 2, totalSteps: 5, status: 'active', startedAt: '2026-04-15' },
  { id: 'PB-3', name: 'Expansion Play', accountName: 'Delta SA', currentStep: 4, totalSteps: 4, status: 'completed', startedAt: '2026-02-10' },
  { id: 'PB-4', name: 'Renewal Prep', accountName: 'Gamma Ltd', currentStep: 1, totalSteps: 6, status: 'paused', startedAt: '2026-04-20' },
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

const StyledPlaybookName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledBadge = styled.span<{ variant: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ variant }) =>
    variant === 'active' ? themeCssVariables.color.green :
    variant === 'completed' ? themeCssVariables.color.blue :
    themeCssVariables.color.gray50};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledProgressBar = styled.div`
  height: 8px;
  background: ${themeCssVariables.background.transparent.lighter};
  border-radius: 4px;
  overflow: hidden;
`;

const StyledProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  background: ${themeCssVariables.color.blue};
  border-radius: 4px;
`;

const StyledMeta = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

export const PlaybookRunner = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Active Playbooks`}</StyledTitle>
      {MOCK_PLAYBOOKS.map((playbook) => {
        const percentage = Math.round((playbook.currentStep / playbook.totalSteps) * 100);
        return (
          <StyledCard key={playbook.id}>
            <StyledCardHeader>
              <StyledPlaybookName>{playbook.name}</StyledPlaybookName>
              <StyledBadge variant={playbook.status}>{playbook.status}</StyledBadge>
            </StyledCardHeader>
            <StyledMeta>{playbook.accountName} &middot; {t`Step`} {playbook.currentStep}/{playbook.totalSteps}</StyledMeta>
            <StyledProgressBar>
              <StyledProgressFill percentage={percentage} />
            </StyledProgressBar>
          </StyledCard>
        );
      })}
    </StyledContainer>
  );
};
