import { isNull, isNumber, isObject } from '@sniptt/guards';

export const applyInputSelectionRequest = ({
  element,
  request,
}: {
  element: HTMLInputElement | HTMLTextAreaElement;
  request: unknown;
}): void => {
  if (!element.isConnected || !isObject(request)) {
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
      command.direction === 'forward' || command.direction === 'backward'
        ? command.direction
        : 'none',
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
    (command.value === 'forward' ||
      command.value === 'backward' ||
      command.value === 'none' ||
      isNull(command.value))
  ) {
    element.selectionDirection = command.value;
  }
};
