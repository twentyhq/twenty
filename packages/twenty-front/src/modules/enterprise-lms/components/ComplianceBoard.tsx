import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ComplianceItem } from '../types/lms.types';

const MOCK_COMPLIANCE: ComplianceItem[] = [
  { id: 'CP1', certificationName: 'Data Privacy (GDPR)', userName: 'Pedro Ruiz', department: 'Engineering', expiresAt: '2026-03-15', status: 'expired' },
  { id: 'CP2', certificationName: 'Cybersecurity Awareness', userName: 'Carlos Mendez', department: 'Sales', expiresAt: '2026-05-10', status: 'expiring_soon' },
  { id: 'CP3', certificationName: 'Anti-Money Laundering', userName: 'Luis Reyes', department: 'Finance', expiresAt: '2026-04-01', status: 'expired' },
  { id: 'CP4', certificationName: 'Workplace Safety', userName: 'Ana Torres', department: 'Engineering', expiresAt: '2027-01-15', status: 'valid' },
  { id: 'CP5', certificationName: 'Data Privacy (GDPR)', userName: 'Sofia Garcia', department: 'Marketing', expiresAt: '2026-06-01', status: 'expiring_soon' },
];

const STATUS_COLORS: Record<string, string> = {
  valid: themeCssVariables.color.turquoise,
  expiring_soon: themeCssVariables.color.yellow,
  expired: themeCssVariables.color.red,
};

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

const StyledAlert = styled.div`
  padding: ${themeCssVariables.spacing[2]};
  background: ${themeCssVariables.background.transparent.lighter};
  border-left: 4px solid ${themeCssVariables.color.red};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.color.red};
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRow = styled.div<{ statusColor: string }>`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
  border-left: 3px solid ${({ statusColor }) => statusColor};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledCert = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
`;

const StyledUser = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  min-width: 120px;
`;

const StyledExpiry = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  min-width: 90px;
`;

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

export const ComplianceBoard = () => {
  useLingui();

  const overdueCount = MOCK_COMPLIANCE.filter((c) => c.status === 'expired').length;

  return (
    <StyledContainer>
      <StyledTitle>{t`Compliance Board`}</StyledTitle>
      {overdueCount > 0 && (
        <StyledAlert>{overdueCount} {t`certifications are expired and need immediate attention`}</StyledAlert>
      )}
      <StyledList>
        {MOCK_COMPLIANCE.map((item) => (
          <StyledRow key={item.id} statusColor={STATUS_COLORS[item.status]}>
            <StyledCert>{item.certificationName}</StyledCert>
            <StyledUser>{item.userName}</StyledUser>
            <StyledExpiry>{item.expiresAt}</StyledExpiry>
            <StyledBadge color={STATUS_COLORS[item.status]}>{item.status.replace('_', ' ')}</StyledBadge>
          </StyledRow>
        ))}
      </StyledList>
    </StyledContainer>
  );
};
