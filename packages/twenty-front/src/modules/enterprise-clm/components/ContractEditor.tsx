import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { RedlineEntry } from '../types/clm.types';

const MOCK_REDLINES: RedlineEntry[] = [
  { id: 'R1', version: 1, author: 'Maria Lopez', timestamp: '2026-04-20T10:00:00Z', changesSummary: 'Initial draft created', status: 'accepted' },
  { id: 'R2', version: 2, author: 'Bancolombia Legal', timestamp: '2026-04-22T14:00:00Z', changesSummary: 'Modified liability cap in Section 8.2', status: 'accepted' },
  { id: 'R3', version: 3, author: 'Carlos Mendez', timestamp: '2026-04-25T09:00:00Z', changesSummary: 'Updated payment terms to Net-30', status: 'pending' },
  { id: 'R4', version: 4, author: 'Bancolombia Legal', timestamp: '2026-04-27T11:00:00Z', changesSummary: 'Added data residency clause', status: 'pending' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: themeCssVariables.color.yellow,
  accepted: themeCssVariables.color.turquoise,
  rejected: themeCssVariables.color.red,
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

const StyledContent = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  background: ${themeCssVariables.background.transparent.lighter};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  line-height: 1.6;
  min-height: 120px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[2]};
  }
`;

const StyledSectionTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
`;

const StyledRedline = styled.div<{ statusColor: string }>`
  padding: ${themeCssVariables.spacing[2]};
  border-left: 3px solid ${({ statusColor }) => statusColor};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledVersion = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledAuthor = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledChange = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  flex: 1;
  min-width: 200px;
`;

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

export const ContractEditor = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`SaaS License Agreement`}</StyledTitle>
      <StyledContent>
        {t`This Software-as-a-Service License Agreement ("Agreement") is entered into as of January 1, 2026, by and between the parties. The Licensor grants the Licensee a non-exclusive, non-transferable right to use the Software...`}
      </StyledContent>
      <StyledSectionTitle>{t`Redline History`}</StyledSectionTitle>
      {MOCK_REDLINES.map((entry) => (
        <StyledRedline key={entry.id} statusColor={STATUS_COLORS[entry.status]}>
          <StyledVersion>v{entry.version}</StyledVersion>
          <StyledChange>{entry.changesSummary}</StyledChange>
          <StyledAuthor>{entry.author} - {new Date(entry.timestamp).toLocaleDateString()}</StyledAuthor>
          <StyledBadge color={STATUS_COLORS[entry.status]}>{entry.status}</StyledBadge>
        </StyledRedline>
      ))}
    </StyledContainer>
  );
};
