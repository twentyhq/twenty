import { RecordTableRowVirtualizedRouterLevel2 } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedRouterLevel2';
import { RecordTableRowVirtualizedSkeleton } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedSkeleton';
import { lowDetailsActivatedComponentState } from '@/object-record/record-table/virtualization/states/lowDetailsActivatedComponentState';

import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

type RecordTableRowVirtualizedRouterLevel1Props = {
  realIndex: number;
};

export const RecordTableRowVirtualizedRouterLevel1 = ({
  realIndex,
}: RecordTableRowVirtualizedRouterLevel1Props) => {
  const lowDetailsActivated = useRecoilComponentValue(
    lowDetailsActivatedComponentState,
  );

  if (lowDetailsActivated) {
    return <RecordTableRowVirtualizedSkeleton />;
  }

  return <RecordTableRowVirtualizedRouterLevel2 realIndex={realIndex} />;
};
