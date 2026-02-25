import { RecordTableRowVirtualizedRouterLevel2 } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedRouterLevel2';
import { RecordTableRowVirtualizedSkeleton } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedSkeleton';
import { lowDetailsActivatedComponentState } from '@/object-record/record-table/virtualization/states/lowDetailsActivatedComponentState';

import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type RecordTableRowVirtualizedRouterLevel1Props = {
  realIndex: number;
};

export const RecordTableRowVirtualizedRouterLevel1 = ({
  realIndex,
}: RecordTableRowVirtualizedRouterLevel1Props) => {
  const lowDetailsActivated = useAtomComponentStateValue(
    lowDetailsActivatedComponentState,
  );

  if (lowDetailsActivated === true) {
    return <RecordTableRowVirtualizedSkeleton />;
  }

  return <RecordTableRowVirtualizedRouterLevel2 realIndex={realIndex} />;
};
