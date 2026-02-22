import { useMemo } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { type RecordFilterValueDependencies } from 'twenty-shared/types';

export const useFilterValueDependencies = (): {
  filterValueDependencies: RecordFilterValueDependencies;
} => {
  const { id: currentWorkspaceMemberId } =
    useRecoilValueV2(currentWorkspaceMemberState) ?? {};

  const { userTimezone } = useUserTimezone();

  const filterValueDependencies = useMemo(
    () => ({
      currentWorkspaceMemberId,
      timeZone: userTimezone,
    }),
    [currentWorkspaceMemberId, userTimezone],
  );

  return { filterValueDependencies };
};
