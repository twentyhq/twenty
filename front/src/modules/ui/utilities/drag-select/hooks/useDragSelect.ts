import { useRecoilCallback, useRecoilState } from 'recoil';

import { isDragSelectionStartEnabledState } from '../states/internal/isDragSelectionStartEnabledState';

export const useDragSelect = () => {
  const [, setIsDragSelectionStartEnabled] = useRecoilState(
    isDragSelectionStartEnabledState,
  );

  const setDragSelectionStartEnabled = (isEnabled: boolean) => {
    setIsDragSelectionStartEnabled(isEnabled);
  };

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
};
