import { RecordTableRowVirtualizedRouterLevel2 } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedRouterLevel2';
import { RecordTableRowVirtualizedSkeleton } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedSkeleton';
import { lowDetailsActivatedComponentState } from '@/object-record/record-table/virtualization/states/lowDetailsActivatedComponentState';

import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

type RecordTableRowVirtualizedRouterLevel1Props = {
  realIndex: number;
};

export const RecordTableRowVirtualizedRouterLevel1 = ({
  realIndex,
}: RecordTableRowVirtualizedRouterLevel1Props) => {
  const lowDetailsActivated = useRecoilComponentValueV2(
    lowDetailsActivatedComponentState,
  );

  if (lowDetailsActivated === true) {
    return <RecordTableRowVirtualizedSkeleton />;
  }

  return <RecordTableRowVirtualizedRouterLevel2 realIndex={realIndex} />;
};
