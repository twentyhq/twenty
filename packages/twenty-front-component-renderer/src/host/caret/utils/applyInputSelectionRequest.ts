import { isNull, isNumber } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { isInputSelectionDirection } from '@/utils/isInputSelectionDirection';
import { normalizeInputSelectionDirection } from '@/utils/normalizeInputSelectionDirection';

export const applyInputSelectionRequest = ({
  element,
  request,
}: {
  element: CaretPreservingElement | null;
  request: unknown;
}): void => {
  if (!isDefined(element) || !element.isConnected || !isPlainObject(request)) {
    return;
  }

  if (request.method === 'select') {
    element.select();
    return;
  }

  const supportsSelectionRange = !isNull(element.selectionStart);

  if (!supportsSelectionRange) {
    return;
  }

  if (
    request.method === 'setSelectionRange' &&
    isNumber(request.start) &&
    isNumber(request.end)
  ) {
    element.setSelectionRange(
      request.start,
      request.end,
      normalizeInputSelectionDirection(request.direction),
    );
    return;
  }

  if (
    (request.property === 'selectionStart' ||
      request.property === 'selectionEnd') &&
    isNumber(request.value)
  ) {
    element[request.property] = request.value;
    return;
  }

  if (
    request.property === 'selectionDirection' &&
    isInputSelectionDirection(request.value)
  ) {
    element.selectionDirection = request.value;
  }
};
