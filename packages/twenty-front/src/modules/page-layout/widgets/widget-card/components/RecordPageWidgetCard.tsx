import { BaseWidgetCard } from '@/page-layout/widgets/widget-card/components/BaseWidgetCard';
import styled from '@emotion/styled';

const StyledRecordPageWidgetCard = styled(BaseWidgetCard)`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.border.radius.md};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export { StyledRecordPageWidgetCard as RecordPageWidgetCard };
