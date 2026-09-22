import { lastShowPageRecordIdState } from '@/object-record/record-field/ui/states/lastShowPageRecordId';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useLazyFindRecordPositionInIndex } from '@/object-record/record-index/hooks/useLazyFindRecordPositionInIndex';
import { recordIndexRecordToRevealComponentState } from '@/object-record/record-index/states/recordIndexRecordToRevealComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Grouped views paginate per group, so the targeted record is resolved once
// into the group it belongs to and its position there; the group's own
// loader then fetches up to that position and focuses the record.
export const RecordIndexRecordToRevealEffect = () => {
  const store = useStore();

  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const lastShowPageRecordIdAtom = useAtomComponentStateCallbackState(
    lastShowPageRecordIdState,
  );

  // Subscribed only to re-run the effect when a record gets targeted while the
  // view is already mounted; the effect reads the value from the store.
  const lastShowPageRecordId = useAtomComponentStateValue(
    lastShowPageRecordIdState,
  );

  const recordToRevealAtom = useAtomComponentStateCallbackState(
    recordIndexRecordToRevealComponentState,
  );

  const { findRecordPositionInIndex } =
    useLazyFindRecordPositionInIndex(objectNameSingular);

  useEffect(() => {
    const recordIdToReveal = store.get(lastShowPageRecordIdAtom);

    if (!isNonEmptyString(recordIdToReveal)) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      store.set(lastShowPageRecordIdAtom, null);

      const recordPosition = await findRecordPositionInIndex(recordIdToReveal);

      if (
        cancelled ||
        !isDefined(recordPosition) ||
        !isDefined(recordPosition.recordGroupId)
      ) {
        return;
      }

      store.set(recordToRevealAtom, {
        recordId: recordIdToReveal,
        recordGroupId: recordPosition.recordGroupId,
        positionInGroup: recordPosition.position,
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    store,
    lastShowPageRecordIdAtom,
    lastShowPageRecordId,
    recordToRevealAtom,
    findRecordPositionInIndex,
  ]);

  useEffect(() => {
    return () => {
      store.set(recordToRevealAtom, null);
    };
  }, [store, recordToRevealAtom]);

  return null;
};
