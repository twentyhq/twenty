import { type EventRef } from '@/front-component-renderer/build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/front-component-renderer/build/jsx-runtime/types/user-ref.type';
import { createEventRef } from '@/front-component-renderer/build/jsx-runtime/utils/create-event-ref';

export const replaceJsxEventRefInnerRef = (
  jsxEventRef: EventRef,
  innerRef: UserRef,
): EventRef => {
  const lastInnerRefReplacement = jsxEventRef._lastInnerRefReplacement;
  const canReuseLastInnerRefReplacement =
    lastInnerRefReplacement !== undefined &&
    lastInnerRefReplacement._innerRef === innerRef;
  if (canReuseLastInnerRefReplacement) {
    return lastInnerRefReplacement;
  }

  const innerRefReplacement = createEventRef(
    jsxEventRef._eventHandlers,
    innerRef,
    'jsx',
  );
  jsxEventRef._lastInnerRefReplacement = innerRefReplacement;
  return innerRefReplacement;
};
