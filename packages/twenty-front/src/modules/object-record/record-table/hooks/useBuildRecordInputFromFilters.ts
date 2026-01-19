import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { buildRecordInputFromFilter } from '@/object-record/record-table/utils/buildRecordInputFromFilter';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';

export const useBuildRecordInputFromFilters = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  // we might need to build a recoil callback for better performance
  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const buildRecordInputFromFilters = (): Partial<ObjectRecord> => {
    return buildRecordInputFromFilter({
      currentRecordFilters,
      objectMetadataItem,
      currentWorkspaceMember: currentWorkspaceMember ?? undefined,
    });
  };

  return { buildRecordInputFromFilters };
};
