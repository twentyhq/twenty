import { isDefined } from 'twenty-shared/utils';

import { SidePanelMergeWithRecordList } from '@/side-panel/pages/merge-with-record/components/SidePanelMergeWithRecordList';
import { mergeWithRecordSourceComponentState } from '@/side-panel/pages/merge-with-record/states/mergeWithRecordSourceComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const SidePanelMergeWithRecordPage = () => {
  const mergeWithRecordSource = useAtomComponentStateValue(
    mergeWithRecordSourceComponentState,
  );

  if (!isDefined(mergeWithRecordSource)) {
    return null;
  }

  return (
    <SidePanelMergeWithRecordList
      objectNameSingular={mergeWithRecordSource.objectNameSingular}
      recordId={mergeWithRecordSource.recordId}
    />
  );
};
