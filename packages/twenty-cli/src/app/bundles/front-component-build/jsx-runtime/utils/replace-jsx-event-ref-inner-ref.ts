import { type EventRef } from '@/app/bundles/front-component-build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/app/bundles/front-component-build/jsx-runtime/types/user-ref.type';
import { createEventRef } from '@/app/bundles/front-component-build/jsx-runtime/utils/create-event-ref';

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
