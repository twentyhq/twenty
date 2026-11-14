import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type View } from '@/views/types/View';
import { useEffect, useState } from 'react';
import { type ViewSortDirection } from '~/generated-metadata/graphql';

type RecordTableSettingsSortsInitializeStateEffectProps = {
  view: View;
};

export const RecordTableSettingsSortsInitializeStateEffect = ({
  view,
}: RecordTableSettingsSortsInitializeStateEffectProps) => {
  const setCurrentRecordSorts = useSetAtomComponentState(
    currentRecordSortsComponentState,
  );

  const [hasInitializedSorts, setHasInitializedSorts] = useState(false);

  // The editor state outlives the sub-page (record pages key it apart from the live widget), so reseed it on every open
  useEffect(() => {
    if (hasInitializedSorts) {
      return;
    }

    const recordSorts: RecordSort[] = (view.viewSorts ?? []).map(
      (viewSort) => ({
        id: viewSort.id,
        fieldMetadataId: viewSort.fieldMetadataId,
        direction: viewSort.direction as ViewSortDirection,
      }),
    );

    setCurrentRecordSorts(recordSorts);
    setHasInitializedSorts(true);
  }, [view, hasInitializedSorts, setCurrentRecordSorts]);

  return null;
};
