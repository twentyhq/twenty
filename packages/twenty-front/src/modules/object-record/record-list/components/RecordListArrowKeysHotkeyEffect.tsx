import { useMemo } from 'react';

import { RECORD_SELECTION_ARROW_KEY_HOTKEYS } from '@/object-record/record-selection/constants/RecordSelectionArrowKeyHotkeys';
import { useRecordSelectionArrowKeyNavigation } from '@/object-record/record-selection/hooks/useRecordSelectionArrowKeyNavigation';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

type RecordListArrowKeysHotkeyEffectProps = {
  containerElement: HTMLElement | null;
};

export const RecordListArrowKeysHotkeyEffect = ({
  containerElement,
}: RecordListArrowKeysHotkeyEffectProps) => {
  const containerRef = useMemo(
    () => ({ current: containerElement }),
    [containerElement],
  );

  const { navigateWithArrowKey } = useRecordSelectionArrowKeyNavigation({
    selectableItemsContainerRef: containerRef,
  });

  useHotkeysOnFocusedElement({
    keys: RECORD_SELECTION_ARROW_KEY_HOTKEYS,
    callback: navigateWithArrowKey,
    focusId: PageFocusId.RecordIndex,
    dependencies: [navigateWithArrowKey],
  });

  return null;
};
