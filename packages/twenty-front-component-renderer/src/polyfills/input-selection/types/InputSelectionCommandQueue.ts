import { type InputSelectionCommand } from '@/types/InputSelectionCommand';
import { type InputSelectionRequest } from '@/types/InputSelectionRequest';

export type InputSelectionCommandQueue = {
  readPendingCommands: (element: object) => InputSelectionCommand[];
  enqueueCommand: (input: {
    element: object;
    request: InputSelectionRequest;
  }) => void;
  acknowledgeCommands: (input: {
    element: object;
    acknowledgedCommandSequence: number;
  }) => void;
  discardPendingCommands: (element: object) => void;
};
