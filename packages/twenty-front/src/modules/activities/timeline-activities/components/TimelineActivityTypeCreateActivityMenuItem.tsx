import { useCreateActivityForTargetRecord } from '@/activities/hooks/useCreateActivityForTargetRecord';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

type TimelineActivityTypeCreateActivityMenuItemProps = {
  timelineActivityType: TimelineActivityType;
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  onActionStarted: () => void;
};

export const TimelineActivityTypeCreateActivityMenuItem = ({
  timelineActivityType,
  activityObjectNameSingular,
  onActionStarted,
}: TimelineActivityTypeCreateActivityMenuItemProps) => {
  const targetRecord = useTargetRecord();
  const { getIcon } = useIcons();

  const { canCreateActivity, createActivity } =
    useCreateActivityForTargetRecord({
      targetRecord,
      activityObjectNameSingular,
    });

  if (!canCreateActivity) {
    return null;
  }

  const handleClick = () => {
    onActionStarted();
    createActivity();
  };

  return (
    <MenuItem
      LeftIcon={
        isDefined(timelineActivityType.icon)
          ? getIcon(timelineActivityType.icon)
          : undefined
      }
      text={timelineActivityType.label}
      onClick={handleClick}
    />
  );
};
