import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useRecordBoardSelectAllHotkeys = ({
  recordBoardId,
  focusId,
}: {
  recordBoardId: string;
  focusId: string;
}) => {
  const recordIndexAllRecordIdsState = useRecoilComponentCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { setRecordAsSelected } = useRecordBoardSelection(recordBoardId);

  const selectAll = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsState,
        );

        for (const recordId of allRecordIds) {
          setRecordAsSelected(recordId, true);
        }
      },
    [recordIndexAllRecordIdsState, setRecordAsSelected],
  );

  useHotkeysOnFocusedElement({
    keys: ['ctrl+a', 'meta+a'],
    callback: selectAll,
    focusId,
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [selectAll],
    options: {
      enableOnFormTags: false,
    },
  });
};
