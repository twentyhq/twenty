import { RecordViewsList } from '@/side-panel/pages/record-views/components/RecordViewsList';
import { recordViewsTargetComponentState } from '@/side-panel/pages/record-views/states/recordViewsTargetComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelRecordViewsPage = () => {
  const recordViewsTarget = useAtomComponentStateValue(
    recordViewsTargetComponentState,
  );

  return isDefined(recordViewsTarget) ? (
    <RecordViewsList
      key={`${recordViewsTarget.objectNameSingular}:${recordViewsTarget.recordId}`}
      objectNameSingular={recordViewsTarget.objectNameSingular}
      recordId={recordViewsTarget.recordId}
    />
  ) : null;
};
