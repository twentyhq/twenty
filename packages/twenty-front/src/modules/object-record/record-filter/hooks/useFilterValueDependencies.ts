import { useContext, useMemo } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { RecordFilterValueDependenciesContext } from '@/object-record/record-filter/contexts/RecordFilterValueDependenciesContext';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type RecordFilterValueDependencies } from 'twenty-shared/types';

export const useFilterValueDependencies = (): {
  filterValueDependencies: RecordFilterValueDependencies;
} => {
  const { id: currentWorkspaceMemberId } =
    useAtomStateValue(currentWorkspaceMemberState) ?? {};

  const { userTimezone } = useUserTimezone();

  const { currentRecord } = useContext(RecordFilterValueDependenciesContext);

  const filterValueDependencies = useMemo(
    () => ({
      currentWorkspaceMemberId,
      currentRecord,
      timeZone: userTimezone,
    }),
    [currentWorkspaceMemberId, currentRecord, userTimezone],
  );

  return { filterValueDependencies };
};
