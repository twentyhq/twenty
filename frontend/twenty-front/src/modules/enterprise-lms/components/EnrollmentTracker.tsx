import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { EnrollmentData } from '../types/lms.types';

const MOCK_ENROLLMENTS: EnrollmentData[] = [
  { id: 'EN1', userId: 'U1', userName: 'Ana Torres', courseId: 'CR1', courseName: 'Data Privacy Fundamentals', status: 'completed', progressPercent: 100, enrolledAt: '2026-03-01', completedAt: '2026-03-15' },
  { id: 'EN2', userId: 'U2', userName: 'Carlos Mendez', courseId: 'CR1', courseName: 'Data Privacy Fundamentals', status: 'in_progress', progressPercent: 60, enrolledAt: '2026-04-01', dueDate: '2026-05-01' },
  { id: 'EN3', userId: 'U3', userName: 'Pedro Ruiz', courseId: 'CR4', courseName: 'Cybersecurity Awareness', status: 'overdue', progressPercent: 20, enrolledAt: '2026-02-01', dueDate: '2026-03-31' },
  { id: 'EN4', userId: 'U4', userName: 'Sofia Garcia', courseId: 'CR2', courseName: 'Sales Methodology', status: 'enrolled', progressPercent: 0, enrolledAt: '2026-04-20' },
];

const STATUS_COLORS: Record<string, string> = {
  enrolled: themeCssVariables.color.gray50,
  in_progress: themeCssVariables.color.blue,
  completed: themeCssVariables.color.turquoise,
  overdue: themeCssVariables.color.red,
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

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

export const EnrollmentTracker = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Enrollment Tracker`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`User`}</StyledTh>
            <StyledTh>{t`Course`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledTh>{t`Progress`}</StyledTh>
            <StyledHideMobileHeader>{t`Due Date`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_ENROLLMENTS.map((enrollment) => (
            <tr key={enrollment.id}>
              <StyledTd>{enrollment.userName}</StyledTd>
              <StyledTd>{enrollment.courseName}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[enrollment.status]}>
                  {enrollment.status.replace('_', ' ')}
                </StyledBadge>
              </StyledTd>
              <StyledTd>{enrollment.progressPercent}%</StyledTd>
              <StyledHideMobile>{enrollment.dueDate ?? '—'}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
