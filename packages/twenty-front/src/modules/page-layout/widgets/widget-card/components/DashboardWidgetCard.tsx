import { BaseWidgetCard } from '@/page-layout/widgets/widget-card/components/BaseWidgetCard';
import styled from '@emotion/styled';

const StyledDashboardWidgetCard = styled(BaseWidgetCard)`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

export { StyledDashboardWidgetCard as DashboardWidgetCard };
