import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { StakeholderData } from '../types/abm.types';

const SENTIMENT_COLORS: Record<string, string> = {
  positive: themeCssVariables.color.green,
  neutral: themeCssVariables.color.yellow,
  negative: themeCssVariables.color.red,
};

const MOCK_STAKEHOLDERS: StakeholderData[] = [
  { id: 'S-1', name: 'Carlos Mendez', title: 'CTO', accountName: 'Acme Corp', role: 'decision_maker', sentiment: 'positive', lastContact: '2026-04-25' },
  { id: 'S-2', name: 'Sofia Garcia', title: 'VP Engineering', accountName: 'Acme Corp', role: 'champion', sentiment: 'positive', lastContact: '2026-04-27' },
  { id: 'S-3', name: 'Pedro Ruiz', title: 'CFO', accountName: 'Beta Inc', role: 'blocker', sentiment: 'negative', lastContact: '2026-04-10' },
  { id: 'S-4', name: 'Laura Diaz', title: 'Director IT', accountName: 'Beta Inc', role: 'influencer', sentiment: 'neutral', lastContact: '2026-04-18' },
  { id: 'S-5', name: 'Miguel Herrera', title: 'CEO', accountName: 'Gamma Ltd', role: 'decision_maker', sentiment: 'neutral', lastContact: '2026-04-22' },
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
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledRole = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  text-transform: uppercase;
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledMeta = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledDot = styled.span<{ color: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
  margin-right: 4px;
`;

export const StakeholderMap = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Stakeholder Map`}</StyledTitle>
      <StyledGrid>
        {MOCK_STAKEHOLDERS.map((stakeholder) => (
          <StyledCard key={stakeholder.id}>
            <StyledName>{stakeholder.name}</StyledName>
            <StyledMeta>{stakeholder.title} &middot; {stakeholder.accountName}</StyledMeta>
            <StyledRole>{stakeholder.role.replace('_', ' ')}</StyledRole>
            <StyledMeta>
              <StyledDot color={SENTIMENT_COLORS[stakeholder.sentiment]} />
              {stakeholder.sentiment}
            </StyledMeta>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
