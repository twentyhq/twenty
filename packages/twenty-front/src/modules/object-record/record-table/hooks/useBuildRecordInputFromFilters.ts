import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { buildRecordInputFromFilter } from '@/object-record/record-table/utils/buildRecordInputFromFilter';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useBuildRecordInputFromFilters = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const currentRecordFilters = useAtomComponentValue(
    currentRecordFiltersComponentState,
  );

  const currentWorkspaceMember = useAtomValue(currentWorkspaceMemberState);

  const buildRecordInputFromFilters = (): Partial<ObjectRecord> => {
    return buildRecordInputFromFilter({
      currentRecordFilters,
      objectMetadataItem,
      currentWorkspaceMember: currentWorkspaceMember ?? undefined,
    });
  };

  return { buildRecordInputFromFilters };
};
