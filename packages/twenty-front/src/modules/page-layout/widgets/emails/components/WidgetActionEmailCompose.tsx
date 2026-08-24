import { useComposeEmailRelatedRecordAction } from '@/activities/emails/hooks/useComposeEmailRelatedRecordAction';
import { WidgetActionRelatedRecord } from '@/page-layout/widgets/components/WidgetActionRelatedRecord';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

export const WidgetActionEmailCompose = () => {
  const targetRecord = useTargetRecord();
  const binding = useComposeEmailRelatedRecordAction({
    targetRecord,
    isPermissionGated: false,
  });

  return <WidgetActionRelatedRecord binding={binding} />;
};
