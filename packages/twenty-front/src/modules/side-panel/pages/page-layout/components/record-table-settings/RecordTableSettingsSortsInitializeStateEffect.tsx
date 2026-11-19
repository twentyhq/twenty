import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type View } from '@/views/types/View';
import { useEffect, useState } from 'react';

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

    setCurrentRecordSorts(
      view.viewSorts.map(
        ({ id, fieldMetadataId, direction, subFieldName }) => ({
          id,
          fieldMetadataId,
          direction,
          subFieldName,
        }),
      ),
    );
    setHasInitializedSorts(true);
  }, [view, hasInitializedSorts, setCurrentRecordSorts]);

  return null;
};
