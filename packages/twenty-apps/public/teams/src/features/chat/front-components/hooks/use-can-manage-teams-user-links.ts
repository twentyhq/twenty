import { useEffect, useState } from 'react';

import { currentUserHasRolesPermission } from 'src/features/chat/logic-functions/utils/current-user-has-roles-permission';

type CanManageTeamsUserLinksState = {
  canManage: boolean;
  isPermissionLoading: boolean;
};

const LOADING_STATE: CanManageTeamsUserLinksState = {
  canManage: false,
  isPermissionLoading: true,
};

export const useCanManageTeamsUserLinks = (): CanManageTeamsUserLinksState => {
  const [state, setState] =
    useState<CanManageTeamsUserLinksState>(LOADING_STATE);

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
