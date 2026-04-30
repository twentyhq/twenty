import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ComplianceItem } from '../types/lms.types';
import { GET_LMS_ANALYTICS } from '../hooks/useLMS';

const STATUS_COLORS: Record<string, string> = {
  valid: themeCssVariables.color.turquoise, expiring_soon: themeCssVariables.color.yellow, expired: themeCssVariables.color.red,
};
const StyledContainer = styled.div`
  display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]};
`;
const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0;
`;
const StyledAlert = styled.div`
  padding: ${themeCssVariables.spacing[2]}; background: ${themeCssVariables.background.transparent.lighter};
  border-left: 4px solid ${themeCssVariables.color.red}; border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.color.red};
`;
const StyledList = styled.div`
  display: flex; flex-direction: column; gap: ${themeCssVariables.spacing[1]};
`;
const StyledRow = styled.div<{ statusColor: string }>`
  display: flex; align-items: center; gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]}; border-left: 3px solid ${({ statusColor }) => statusColor};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;
const StyledCert = styled.span`
  font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary}; flex: 1;
`;
const StyledUser = styled.span`
  font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; min-width: 120px;
`;
const StyledExpiry = styled.span`
  font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; min-width: 90px;
`;
const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color}; color: ${themeCssVariables.font.color.inverted};
`;

export const ComplianceBoard = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_LMS_ANALYTICS);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const items: ComplianceItem[] = data?.lmsAnalytics?.compliance ?? [];
  const overdueCount = items.filter((c) => c.status === 'expired').length;
  return (
    <StyledContainer>
      <StyledTitle>{t`Compliance Board`}</StyledTitle>
      {overdueCount > 0 && <StyledAlert>{overdueCount} {t`certifications are expired and need immediate attention`}</StyledAlert>}
      <StyledList>
        {items.map((item) => (
          <StyledRow key={item.id} statusColor={STATUS_COLORS[item.status] ?? themeCssVariables.color.gray50}>
            <StyledCert>{item.certificationName}</StyledCert>
            <StyledUser>{item.userName}</StyledUser>
            <StyledExpiry>{item.expiresAt}</StyledExpiry>
            <StyledBadge color={STATUS_COLORS[item.status] ?? themeCssVariables.color.gray50}>{item.status.replace('_', ' ')}</StyledBadge>
          </StyledRow>
        ))}
      </StyledList>
    </StyledContainer>
  );
};
