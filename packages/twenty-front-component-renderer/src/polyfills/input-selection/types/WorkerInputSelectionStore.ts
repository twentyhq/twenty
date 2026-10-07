import { type InputSelectionRequest } from '@/types/InputSelectionRequest';
import { type InputSelectionState } from '@/types/InputSelectionState';

export type WorkerInputSelectionStore = {
  setRootElement: (rootElement: object) => void;
  applySnapshot: (input: {
    element: object;
    state: InputSelectionState;
  }) => void;
  scheduleDetachedElementSweep: () => void;
  read: (element: object) => InputSelectionState;
  request: (input: { element: object; request: InputSelectionRequest }) => void;
};
