import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { EnrollmentData } from '../types/lms.types';
import { GET_LMS_DATA } from '../hooks/useLMS';

const STATUS_COLORS: Record<string, string> = {
  enrolled: themeCssVariables.color.gray50, in_progress: themeCssVariables.color.blue,
  completed: themeCssVariables.color.turquoise, overdue: themeCssVariables.color.red,
};
const StyledContainer = styled.div`
  display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]};
`;
const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0;
`;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th`
  text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;
const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;
const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color}; color: ${themeCssVariables.font.color.inverted};
`;
const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;
const StyledHideMobileHeader = styled.th`
  text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

export const EnrollmentTracker = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_LMS_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const enrollments: EnrollmentData[] = data?.lmsData?.enrollments ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Enrollment Tracker`}</StyledTitle>
      <StyledTable>
        <thead><tr>
          <StyledTh>{t`User`}</StyledTh><StyledTh>{t`Course`}</StyledTh><StyledTh>{t`Status`}</StyledTh>
          <StyledTh>{t`Progress`}</StyledTh><StyledHideMobileHeader>{t`Due Date`}</StyledHideMobileHeader>
        </tr></thead>
        <tbody>
          {enrollments.map((enrollment) => (
            <tr key={enrollment.id}>
              <StyledTd>{enrollment.userName}</StyledTd>
              <StyledTd>{enrollment.courseName}</StyledTd>
              <StyledTd><StyledBadge color={STATUS_COLORS[enrollment.status] ?? themeCssVariables.color.gray50}>{enrollment.status.replace('_', ' ')}</StyledBadge></StyledTd>
              <StyledTd>{enrollment.progressPercent}%</StyledTd>
              <StyledHideMobile>{enrollment.dueDate ?? '—'}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
