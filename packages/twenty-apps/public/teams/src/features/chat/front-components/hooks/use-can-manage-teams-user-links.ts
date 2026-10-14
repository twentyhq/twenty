import { useEffect, useState } from 'react';

import { currentUserHasRolesPermission } from 'src/features/chat/logic-functions/utils/current-user-has-roles-permission';

export const useCanManageTeamsUserLinks = () => {
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    currentUserHasRolesPermission().then((hasRolesPermission) => {
      if (!isCancelled) {
        setCanManage(hasRolesPermission);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  return { canManage };
};
