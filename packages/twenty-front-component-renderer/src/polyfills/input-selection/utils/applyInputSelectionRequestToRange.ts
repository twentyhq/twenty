import { type InputSelectionRange } from '@/types/InputSelectionRange';
import { type InputSelectionRequest } from '@/types/InputSelectionRequest';

const resolveRequestedRange = ({
  range,
  request,
  valueLength,
}: {
  range: InputSelectionRange;
  request: InputSelectionRequest;
  valueLength: number;
}): InputSelectionRange => {
  if ('method' in request && request.method === 'select') {
    return {
      selectionStart: 0,
      selectionEnd: valueLength,
      selectionDirection: 'none',
    };
  }

  if ('method' in request) {
    return {
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
    range: resolveRequestedRange({ range, request, valueLength }),
    valueLength,
  });
