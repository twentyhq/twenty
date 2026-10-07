import { isNull, isNumber, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

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
  if (!isDefined(element) || !element.isConnected || !isObject(request)) {
    return;
  }

  const remoteRequest = request as Record<string, unknown>;

  if (remoteRequest.method === 'select') {
    element.select();
    return;
  }

  const supportsSelectionRange = !isNull(element.selectionStart);

  if (!supportsSelectionRange) {
    return;
  }

  if (
    remoteRequest.method === 'setSelectionRange' &&
    isNumber(remoteRequest.start) &&
    isNumber(remoteRequest.end)
  ) {
    element.setSelectionRange(
      remoteRequest.start,
      remoteRequest.end,
      normalizeInputSelectionDirection(remoteRequest.direction),
    );
    return;
  }

  if (
    (remoteRequest.property === 'selectionStart' ||
      remoteRequest.property === 'selectionEnd') &&
    (isNumber(remoteRequest.value) || isNull(remoteRequest.value))
  ) {
    element[remoteRequest.property] = remoteRequest.value;
    return;
  }

  if (
    remoteRequest.property === 'selectionDirection' &&
    (isInputSelectionDirection(remoteRequest.value) ||
      isNull(remoteRequest.value))
  ) {
    element.selectionDirection = remoteRequest.value;
  }
};
