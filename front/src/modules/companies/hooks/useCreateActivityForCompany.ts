import { useRecoilCallback } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { ActivityType } from '~/generated/graphql';

export const useCreateActivityForCompany = () => {
  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  return useRecoilCallback(
    () => (type: ActivityType) => {
      openCreateActivityRightDrawer(type, ActivityTargetableEntityType.Company);
    },
    [openCreateActivityRightDrawer],
  );
};
