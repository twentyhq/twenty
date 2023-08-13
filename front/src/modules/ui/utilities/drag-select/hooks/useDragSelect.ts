import { useRecoilCallback, useRecoilState } from 'recoil';

import { isDragSelectionStartEnabledState } from '../states/internal/isDragSelectionStartEnabledState';

export function useDragSelect() {
  const [, setIsDragSelectionStartEnabledInternal] = useRecoilState(
    isDragSelectionStartEnabledState,
  );

  function setDragSelectionStartEnabled(isEnabled: boolean) {
    setIsDragSelectionStartEnabledInternal(isEnabled);
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
