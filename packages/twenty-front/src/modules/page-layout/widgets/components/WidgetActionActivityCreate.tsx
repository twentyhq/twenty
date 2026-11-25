import { useCreateActivityRelatedRecordAction } from '@/activities/hooks/useCreateActivityRelatedRecordAction';
import { WidgetActionRelatedRecord } from '@/page-layout/widgets/components/WidgetActionRelatedRecord';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { type StandardObjectNameSingular } from 'twenty-shared/types';

type WidgetActionActivityCreateProps = {
  activityObjectNameSingular:
    | StandardObjectNameSingular.Note
    | StandardObjectNameSingular.Task;
};

export const WidgetActionActivityCreate = ({
  activityObjectNameSingular,
}: WidgetActionActivityCreateProps) => {
  const targetRecord = useTargetRecord();
  const binding = useCreateActivityRelatedRecordAction({
    targetRecord,
    activityObjectNameSingular,
  });

  return <WidgetActionRelatedRecord binding={binding} />;
};
