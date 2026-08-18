import { useCreateActivityForTargetRecord } from '@/activities/hooks/useCreateActivityForTargetRecord';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';

type WidgetActionActivityCreateProps = {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  label: string;
};

export const WidgetActionActivityCreate = ({
  activityObjectNameSingular,
  label,
}: WidgetActionActivityCreateProps) => {
  const targetRecord = useTargetRecord();

  const { canCreateActivity, createActivity } =
    useCreateActivityForTargetRecord({
      targetRecord,
      activityObjectNameSingular,
    });

  if (!canCreateActivity) {
    return null;
  }

  return (
    <WidgetCardHeaderActionButton
      Icon={IconPlus}
      label={label}
      onClick={createActivity}
    />
  );
};
