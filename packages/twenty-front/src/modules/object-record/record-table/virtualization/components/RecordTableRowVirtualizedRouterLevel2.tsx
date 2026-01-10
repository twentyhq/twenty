import { RecordTableRowVirtualizedFullData } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedFullData';

import { RecordTableRowVirtualizedSkeleton } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedSkeleton';
import { dataLoadingStatusByRealIndexComponentFamilySelector } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentFamilySelector';

import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';

type RecordTableRowVirtualizedRouterLevel2Props = {
  realIndex: number;
};

export const RecordTableRowVirtualizedRouterLevel2 = ({
  realIndex,
}: RecordTableRowVirtualizedRouterLevel2Props) => {
  const dataLoadingStatus = useRecoilComponentFamilyValue(
    dataLoadingStatusByRealIndexComponentFamilySelector,
    realIndex,
  );

  if (dataLoadingStatus !== 'loaded') {
    return <RecordTableRowVirtualizedSkeleton />;
  }

  return <RecordTableRowVirtualizedFullData realIndex={realIndex} />;
};
