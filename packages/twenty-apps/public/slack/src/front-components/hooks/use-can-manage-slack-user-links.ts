import { useEffect, useState } from 'react';

import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';

type CanManageSlackUserLinksState = {
  canManage: boolean;
  isPermissionLoading: boolean;
};

const LOADING_STATE: CanManageSlackUserLinksState = {
  canManage: false,
  isPermissionLoading: true,
};

export const useCanManageSlackUserLinks = (): CanManageSlackUserLinksState => {
  const [state, setState] =
    useState<CanManageSlackUserLinksState>(LOADING_STATE);

  useEffect(() => {
    let cancelled = false;

    setState(LOADING_STATE);

    const fetchPermission = async () => {
      const canManage = await currentUserHasRolesPermission();

      if (!cancelled) {
        setState({ canManage, isPermissionLoading: false });
      }
    };

    fetchPermission();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
