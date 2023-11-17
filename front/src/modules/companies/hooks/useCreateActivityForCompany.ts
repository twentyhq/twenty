import { useRecoilCallback } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { ActivityType } from '@/activities/types/Activity';

export const useCreateActivityForCompany = () => {
  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  return useRecoilCallback(
    () => (type: ActivityType) => {
      openCreateActivityRightDrawer(type, 'Company');
    },
    [openCreateActivityRightDrawer],
  );
};
