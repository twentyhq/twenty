import { useRecoilState } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { IconTrash } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';

type ActivityActionBarProps = {
  activityId: string;
};

export const ActivityActionBar = ({ activityId }: ActivityActionBarProps) => {
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);
  const { deleteOneRecord: deleteOneActivity } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Activity,
    refetchFindManyQuery: true,
  });

  const deleteActivity = () => {
    deleteOneActivity?.(activityId);

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
