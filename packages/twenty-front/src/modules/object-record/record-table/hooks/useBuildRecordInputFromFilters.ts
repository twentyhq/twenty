import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordFilterValueDependenciesContext } from '@/object-record/record-filter/contexts/RecordFilterValueDependenciesContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { buildRecordInputFromFilter } from '@/object-record/record-table/utils/buildRecordInputFromFilter';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext } from 'react';

export const useBuildRecordInputFromFilters = ({
  objectMetadataItem,
  instanceId,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  instanceId?: string;
}) => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    instanceId,
  );

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { currentRecordId } = useContext(RecordFilterValueDependenciesContext);

  const { userTimezone } = useUserTimezone();

  const buildRecordInputFromFilters = (): Partial<ObjectRecord> => {
    return buildRecordInputFromFilter({
      currentRecordFilters,
      objectMetadataItem,
      currentWorkspaceMember: currentWorkspaceMember ?? undefined,
      currentRecordId,
      timeZone: userTimezone,
    });
  };

  return { buildRecordInputFromFilters };
};
