import { RecordTableRowVirtualizedFullData } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedFullData';

import { RecordTableRowVirtualizedSkeleton } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedSkeleton';
import { dataLoadingStatusByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentFamilyState';

import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';

type RecordTableRowVirtualizedRouterLevel2Props = {
  realIndex: number;
};

export const RecordTableRowVirtualizedRouterLevel2 = ({
  realIndex,
}: RecordTableRowVirtualizedRouterLevel2Props) => {
  const dataLoadingStatus = useRecoilComponentFamilyValue(
    dataLoadingStatusByRealIndexComponentFamilyState,
    { realIndex },
  );

  if (dataLoadingStatus === null) {
    return <RecordTableRowVirtualizedSkeleton />;
  }

  return <RecordTableRowVirtualizedFullData realIndex={realIndex} />;
};
