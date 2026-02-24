import { RecordTableRowVirtualizedRouterLevel2 } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedRouterLevel2';
import { RecordTableRowVirtualizedSkeleton } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedSkeleton';
import { lowDetailsActivatedComponentState } from '@/object-record/record-table/virtualization/states/lowDetailsActivatedComponentState';

import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

type RecordTableRowVirtualizedRouterLevel1Props = {
  realIndex: number;
};

export const RecordTableRowVirtualizedRouterLevel1 = ({
  realIndex,
}: RecordTableRowVirtualizedRouterLevel1Props) => {
  const lowDetailsActivated = useAtomComponentValue(
    lowDetailsActivatedComponentState,
  );

  if (lowDetailsActivated === true) {
    return <RecordTableRowVirtualizedSkeleton />;
  }

  return <RecordTableRowVirtualizedRouterLevel2 realIndex={realIndex} />;
};
