import { isNull, isNumber, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { isInputSelectionDirection } from '@/utils/isInputSelectionDirection';
import { normalizeInputSelectionDirection } from '@/utils/normalizeInputSelectionDirection';

export const applyInputSelectionRequest = ({
  element,
  request,
}: {
  element: HTMLInputElement | HTMLTextAreaElement | null;
  request: unknown;
}): void => {
  if (!isDefined(element) || !element.isConnected || !isObject(request)) {
    return;
  }
  const command = request as Record<string, unknown>;
  if (command.method === 'select') {
    element.select();
    return;
  }
  if (isNull(element.selectionStart)) {
    return;
  }
  if (
    command.method === 'setSelectionRange' &&
    isNumber(command.start) &&
    isNumber(command.end)
  ) {
    element.setSelectionRange(
      command.start,
      command.end,
      normalizeInputSelectionDirection(command.direction),
    );
    return;
  }
  if (
    (command.property === 'selectionStart' ||
      command.property === 'selectionEnd') &&
    (isNumber(command.value) || isNull(command.value))
  ) {
    element[command.property] = command.value;
    return;
  }
  if (
    command.property === 'selectionDirection' &&
    (isInputSelectionDirection(command.value) || isNull(command.value))
  ) {
    element.selectionDirection = command.value;
  }
};
