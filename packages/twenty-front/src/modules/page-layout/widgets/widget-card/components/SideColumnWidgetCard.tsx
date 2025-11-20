import { BaseWidgetCard } from '@/page-layout/widgets/widget-card/components/BaseWidgetCard';
import styled from '@emotion/styled';

const StyledSideColumnWidgetCard = styled(BaseWidgetCard)`
  border: none;
  padding: 0;
  border-radius: 0;
  background: ${({ theme }) => theme.background.secondary};
`;

export { StyledSideColumnWidgetCard as SideColumnWidgetCard };
