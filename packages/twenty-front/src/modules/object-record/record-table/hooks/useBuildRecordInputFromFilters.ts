import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordFilterValueDependenciesContext } from '@/object-record/record-filter/contexts/RecordFilterValueDependenciesContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexExcludedRecordFilterIds } from '@/object-record/record-index/hooks/useRecordIndexExcludedRecordFilterIds';
import { omitRecordFiltersExcludedFromQueries } from '@/object-record/record-index/utils/omitRecordFiltersExcludedFromQueries';
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

  const excludedRecordFilterIds = useRecordIndexExcludedRecordFilterIds();

  // A filter the index leaves out of its queries must not pre-fill a new record either
  const queriedRecordFilters = omitRecordFiltersExcludedFromQueries({
    recordFilters: currentRecordFilters,
    excludedRecordFilterIds,
  });

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { currentRecord } = useContext(RecordFilterValueDependenciesContext);

  const { userTimezone } = useUserTimezone();

  const buildRecordInputFromFilters = (): Partial<ObjectRecord> => {
    return buildRecordInputFromFilter({
      currentRecordFilters: queriedRecordFilters,
      objectMetadataItem,
      currentWorkspaceMember: currentWorkspaceMember ?? undefined,
      currentRecordId: currentRecord?.id,
      timeZone: userTimezone,
    });
  };

  return { buildRecordInputFromFilters };
};
