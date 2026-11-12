import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordFilterValueDependenciesContext } from '@/object-record/record-filter/contexts/RecordFilterValueDependenciesContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { recordIndexTabRecordFiltersComponentSelector } from '@/object-record/record-index-tab/states/selectors/recordIndexTabRecordFiltersComponentSelector';
import { buildRecordInputFromFilter } from '@/object-record/record-table/utils/buildRecordInputFromFilter';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
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

  const recordIndexTabRecordFilters = useAtomComponentSelectorValue(
    recordIndexTabRecordFiltersComponentSelector,
    instanceId,
  );

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { currentRecord } = useContext(RecordFilterValueDependenciesContext);

  const { userTimezone } = useUserTimezone();

  const buildRecordInputFromFilters = (): Partial<ObjectRecord> => {
    return buildRecordInputFromFilter({
      currentRecordFilters: [
        ...currentRecordFilters,
        ...recordIndexTabRecordFilters,
      ],
      objectMetadataItem,
      currentWorkspaceMember: currentWorkspaceMember ?? undefined,
      currentRecordId: currentRecord?.id,
      timeZone: userTimezone,
    });
  };

  return { buildRecordInputFromFilters };
};
