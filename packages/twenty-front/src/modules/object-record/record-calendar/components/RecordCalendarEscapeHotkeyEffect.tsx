import { Key } from 'ts-key-enum';

import { recordCalendarSelectedRecordIdsComponentSelector } from '@/object-record/record-calendar/states/selectors/recordCalendarSelectedRecordIdsComponentSelector';
import { useRecordCalendarSelection } from '@/object-record/record-calendar/states/selectors/useRecordCalendarSelection';
import { useResetFocusStackToRecordIndex } from '@/object-record/record-index/hooks/useResetFocusStackToRecordIndex';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

type RecordCalendarEscapeHotkeyEffectProps = {
  recordCalendarId: string;
};

export const RecordCalendarEscapeHotkeyEffect = ({
  recordCalendarId,
}: RecordCalendarEscapeHotkeyEffectProps) => {
  const { resetRecordCalendarSelection } =
    useRecordCalendarSelection(recordCalendarId);
  const { resetFocusStackToRecordIndex } = useResetFocusStackToRecordIndex();

  const selectedRecordIds = useAtomComponentSelectorValue(
    recordCalendarSelectedRecordIdsComponentSelector,
    recordCalendarId,
  );

  const isAtLeastOneRecordSelected = selectedRecordIds.length > 0;

  const handleEscape = () => {
    if (isAtLeastOneRecordSelected) {
      resetRecordCalendarSelection();
    }

    resetFocusStackToRecordIndex();
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handleEscape,
    focusId: PageFocusId.RecordIndex,
    dependencies: [handleEscape],
  });

  return null;
};
