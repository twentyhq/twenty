import { isNumber, isString } from '@sniptt/guards';

import { applyInputSelectionRequestToRange } from '@/polyfills/input-selection/utils/applyInputSelectionRequestToRange';
import { type InputSelectionCommand } from '@/types/InputSelectionCommand';
import { type InputSelectionRange } from '@/types/InputSelectionRange';
import { type InputSelectionState } from '@/types/InputSelectionState';

const UNKNOWN_VALUE_INPUT_SELECTION_STATE: InputSelectionState = {
  selectionStart: 0,
  selectionEnd: 0,
  selectionDirection: 'none',
};

export const resolveOptimisticInputSelectionState = ({
  hostState,
  pendingCommands,
  value,
}: {
  hostState: InputSelectionState | undefined;
  pendingCommands: InputSelectionCommand[];
  value: unknown;
}): InputSelectionState => {
  const valueText = isNumber(value) ? String(value) : value;

  if (!isString(valueText)) {
    return hostState ?? UNKNOWN_VALUE_INPUT_SELECTION_STATE;
  }

  let range: InputSelectionRange = {
    selectionStart: hostState?.selectionStart ?? valueText.length,
    selectionEnd: hostState?.selectionEnd ?? valueText.length,
    selectionDirection: hostState?.selectionDirection ?? 'none',
  };

  for (const { request } of pendingCommands) {
    range = applyInputSelectionRequestToRange({
      range,
      request,
      valueLength: valueText.length,
    });
  }

  return range;
};
