import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { buildRecordInputFromFilter } from '@/object-record/record-table/utils/buildRecordInputFromFilter';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useBuildRecordInputFromFilters = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const currentWorkspaceMember = useRecoilValueV2(currentWorkspaceMemberState);

  const buildRecordInputFromFilters = (): Partial<ObjectRecord> => {
    return buildRecordInputFromFilter({
      currentRecordFilters,
      objectMetadataItem,
      currentWorkspaceMember: currentWorkspaceMember ?? undefined,
    });
  };

  return { buildRecordInputFromFilters };
};
