import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';

export const WorkspaceMemberProvider = ({
  children,
}: React.PropsWithChildren) => {
  const currentUser = useRecoilValue(currentUserState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const [isLoading, setIsLoading] = useState(true);

  useFindManyObjectRecords({
    objectNamePlural: 'workspaceMembersV2',
    filter: {
      userId: { eq: currentUser?.id },
    },
    onCompleted: (data: any) => {
      setCurrentWorkspaceMember(data.edges[0].node);
      setIsLoading(false);
    },
  });

  return isLoading ? <></> : <>{children}</>;
};
