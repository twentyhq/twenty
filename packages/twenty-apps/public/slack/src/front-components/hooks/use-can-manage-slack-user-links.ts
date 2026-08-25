import { useEffect, useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

const WORKSPACE_MEMBERS_PERMISSION_FLAG = 'WORKSPACE_MEMBERS';

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
      try {
        const { currentUser } = await new MetadataApiClient().query({
          currentUser: {
            currentUserWorkspace: {
              permissionFlags: true,
            },
          },
        });

        const canManage = (
          currentUser.currentUserWorkspace?.permissionFlags ?? []
        ).includes(WORKSPACE_MEMBERS_PERMISSION_FLAG);

        if (!cancelled) {
          setState({ canManage, isPermissionLoading: false });
        }
      } catch {
        if (!cancelled) {
          setState({ canManage: false, isPermissionLoading: false });
        }
      }
    };

    fetchPermission();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
