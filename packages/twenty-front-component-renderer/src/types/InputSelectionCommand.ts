import { type InputSelectionRequest } from '@/types/InputSelectionRequest';

export type InputSelectionCommand = {
  sequence: number;
  inputValueSequence?: number;
  request: InputSelectionRequest;
};
