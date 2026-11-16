import { useResetRecordSelectionAcrossRecordGroups } from '@/object-record/record-group/hooks/useResetRecordSelectionAcrossRecordGroups';
import { lastActiveRecordGroupTabIdComponentState } from '@/object-record/record-group/states/lastActiveRecordGroupTabIdComponentState';
import { activeRecordGroupTabIdComponentSelector } from '@/object-record/record-group/states/selectors/activeRecordGroupTabIdComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Also catches the click-less fallback to All, which remounts the body, hence the atom over a ref
export const RecordGroupTabsSelectionResetEffect = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const activeRecordGroupTabId = useAtomComponentSelectorValue(
    activeRecordGroupTabIdComponentSelector,
  );

  const [lastActiveRecordGroupTabId, setLastActiveRecordGroupTabId] =
    useAtomComponentState(lastActiveRecordGroupTabIdComponentState);

  const { resetRecordSelectionAcrossRecordGroups } =
    useResetRecordSelectionAcrossRecordGroups(recordIndexId);

  useEffect(() => {
    if (lastActiveRecordGroupTabId === activeRecordGroupTabId) {
      return;
    }

    if (isDefined(lastActiveRecordGroupTabId)) {
      resetRecordSelectionAcrossRecordGroups();
    }

    setLastActiveRecordGroupTabId(activeRecordGroupTabId);
  }, [
    activeRecordGroupTabId,
    lastActiveRecordGroupTabId,
    resetRecordSelectionAcrossRecordGroups,
    setLastActiveRecordGroupTabId,
  ]);

  return null;
};
