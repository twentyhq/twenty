import { type InputSelectionRange } from '@/types/InputSelectionRange';
import { type InputSelectionRequest } from '@/types/InputSelectionRequest';

const clampInputSelectionRange = ({
  range,
  valueLength,
}: {
  range: InputSelectionRange;
  valueLength: number;
}): InputSelectionRange => {
  const selectionEnd = Math.min(range.selectionEnd, valueLength);

  return {
    selectionStart: Math.min(range.selectionStart, selectionEnd),
    selectionEnd,
    selectionDirection: range.selectionDirection,
  };
};

const resolveRequestedRange = ({
  range,
  request,
}: {
  range: InputSelectionRange;
  request: InputSelectionRequest;
}): InputSelectionRange => {
  if ('method' in request) {
    return request.method === 'select'
      ? {
          selectionStart: 0,
          selectionEnd: Number.POSITIVE_INFINITY,
          selectionDirection: 'none',
        }
      : {
          selectionStart: request.start,
          selectionEnd: request.end,
          selectionDirection: request.direction,
        };
  }

  if (request.property === 'selectionDirection') {
    return { ...range, selectionDirection: request.value };
  }

  if (request.property === 'selectionEnd') {
    return { ...range, selectionEnd: request.value };
  }

  return {
    ...range,
    selectionStart: request.value,
    selectionEnd: Math.max(range.selectionEnd, request.value),
  };
};

export const applyInputSelectionRequestToRange = ({
  range,
  request,
  valueLength,
}: {
  range: InputSelectionRange;
  request: InputSelectionRequest;
  valueLength: number;
}): InputSelectionRange =>
  clampInputSelectionRange({
    range: resolveRequestedRange({ range, request }),
    valueLength,
  });
