import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { WorkOrderData, WorkOrderPriority, WorkOrderStatus } from '../types/fsm.types';
import { GET_FSM_ANALYTICS } from '../hooks/useFSM';

const PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  low: themeCssVariables.color.gray50,
  medium: themeCssVariables.color.yellow,
  high: themeCssVariables.color.orange,
  emergency: themeCssVariables.color.red,
};

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
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

export const WorkOrderList = () => {
  useLingui();

  const { data, loading, error } = useQuery(GET_FSM_ANALYTICS);

  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;

  const workOrders: WorkOrderData[] = data?.fsmAnalytics?.workOrders ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Work Orders`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`ID`}</StyledTh>
            <StyledTh>{t`Title`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledTh>{t`Priority`}</StyledTh>
            <StyledHideMobileHeader>{t`Technician`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Date`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((wo) => (
            <tr key={wo.id}>
              <StyledTd>{wo.id}</StyledTd>
              <StyledTd>{wo.title}</StyledTd>
              <StyledTd>{STATUS_LABELS[wo.status]}</StyledTd>
              <StyledTd>
                <StyledBadge color={PRIORITY_COLORS[wo.priority]}>{wo.priority}</StyledBadge>
              </StyledTd>
              <StyledHideMobile>{wo.technicianName || '—'}</StyledHideMobile>
              <StyledHideMobile>{wo.scheduledDate}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
