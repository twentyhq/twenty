import { useRecoilCallback, useRecoilState } from 'recoil';

import { isDragSelectionStartEnabledState } from '../states/internal/isDragSelectionStartEnabledState';

export function useDragSelect() {
  const [, setIsDragSelectionStartEnabled] = useRecoilState(
    isDragSelectionStartEnabledState,
  );

  function setDragSelectionStartEnabled(isEnabled: boolean) {
    setIsDragSelectionStartEnabled(isEnabled);
  }

  const isDragSelectionStartEnabled = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        return snapshot
          .getLoadable(isDragSelectionStartEnabledState)
          .getValue();
      },
    [],
  );

  return {
    isDragSelectionStartEnabled,
    setDragSelectionStartEnabled,
  };
}
