import { isDefined } from 'twenty-shared/utils';

// Unlike the dnd-kit default, links are not in this list: record chips render
// native anchors and the whole card must stay draggable. Clicks under the
// activation distance still navigate.
const NON_DRAGGABLE_TARGET_SELECTOR = [
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ');

type DragActivationSource = {
  element?: Element | null;
  handle?: Element | null;
};

export const shouldPreventDragActivation = (
  event: PointerEvent,
  source: DragActivationSource,
): boolean => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return false;
  }

  if (target === source.element || target === source.handle) {
    return false;
  }

  if (isDefined(source.handle) && source.handle.contains(target)) {
    return false;
  }

  return Boolean(target.closest(NON_DRAGGABLE_TARGET_SELECTOR));
};
