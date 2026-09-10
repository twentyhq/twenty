import { useComposeCalendarEventRelatedRecordAction } from '@/activities/calendar/hooks/useComposeCalendarEventRelatedRecordAction';
import { WidgetActionRelatedRecord } from '@/page-layout/widgets/components/WidgetActionRelatedRecord';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

export const WidgetActionCalendarEventCreate = () => {
  const targetRecord = useTargetRecord();
  const binding = useComposeCalendarEventRelatedRecordAction(targetRecord);

  return <WidgetActionRelatedRecord binding={binding} />;
};
