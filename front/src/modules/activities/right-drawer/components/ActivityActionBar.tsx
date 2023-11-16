import { useRecoilState } from 'recoil';

import { useDeleteOneObjectRecord } from '@/object-record/hooks/useDeleteOneObjectRecord';
import { IconTrash } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';

type ActivityActionBarProps = {
  activityId: string;
};

export const ActivityActionBar = ({ activityId }: ActivityActionBarProps) => {
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);
  const { deleteOneObject } = useDeleteOneObjectRecord({
    objectNamePlural: 'activitiesV2',
  });

  const deleteActivity = () => {
    deleteOneObject?.(activityId);

    setIsRightDrawerOpen(false);
  };

  return (
    <LightIconButton
      Icon={IconTrash}
      onClick={deleteActivity}
      accent="tertiary"
      size="medium"
    />
  );
};
