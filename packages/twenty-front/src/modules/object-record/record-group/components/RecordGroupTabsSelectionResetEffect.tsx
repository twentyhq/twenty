import { lastActiveRecordGroupTabIdComponentState } from '@/object-record/record-group/states/lastActiveRecordGroupTabIdComponentState';
import { activeRecordGroupTabIdComponentSelector } from '@/object-record/record-group/states/selectors/activeRecordGroupTabIdComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

// The active tab also changes without a click, e.g. when its group empties and
// "Hide empty groups" falls back to All; the last tab is kept in state because
// that switch remounts the table body and this effect with it
export const RecordGroupTabsSelectionResetEffect = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const activeRecordGroupTabId = useAtomComponentSelectorValue(
    activeRecordGroupTabIdComponentSelector,
  );

  const [lastActiveRecordGroupTabId, setLastActiveRecordGroupTabId] =
    useAtomComponentState(lastActiveRecordGroupTabIdComponentState);

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  useEffect(() => {
    if (lastActiveRecordGroupTabId === activeRecordGroupTabId) {
      return;
    }

    if (isDefined(lastActiveRecordGroupTabId)) {
      resetRecordSelection();
    }

    setLastActiveRecordGroupTabId(activeRecordGroupTabId);
  }, [
    activeRecordGroupTabId,
    lastActiveRecordGroupTabId,
    resetRecordSelection,
    setLastActiveRecordGroupTabId,
  ]);

  return null;
};
