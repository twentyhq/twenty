import { isFunction, isUndefined } from '@sniptt/guards';

import { EVENT_TO_REACT } from '@/constants/EventToReact';
import { hasDangerousUrlScheme } from '@/host/utils/hasDangerousUrlScheme';
import { isEventHandlerKey } from '@/host/utils/isEventHandlerKey';
import { isNavigationUrlAttribute } from '@/host/utils/isNavigationUrlAttribute';
import { parseCssString } from '@/host/utils/parseCssString';
import { wrapEventHandler } from '@/host/utils/wrapEventHandler';
import { type SerializedEventData } from '@/types/SerializedEventData';

const INTERNAL_PROPS = new Set(['element', 'receiver', 'components']);

const EVENT_NAME_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(EVENT_TO_REACT).map(([domEvent, reactProp]) => [
    `on${domEvent}`,
    reactProp,
  ]),
);

export const filterProps = <T extends object>(props: T, htmlTag: string): T => {
  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (INTERNAL_PROPS.has(key) || isUndefined(value)) {
      continue;
    }

    if (key === 'style') {
      filtered.style = parseCssString(value as string | undefined);
      continue;
    }

    const normalizedKey = EVENT_NAME_MAP[key.toLowerCase()] || key;

    if (isEventHandlerKey(normalizedKey)) {
      if (isFunction(value)) {
        filtered[normalizedKey] = wrapEventHandler(
          value as (detail: SerializedEventData) => void,
        );
      }
      continue;
    }

    if (
      isNavigationUrlAttribute(htmlTag, normalizedKey) &&
      hasDangerousUrlScheme(value)
    ) {
      continue;
    }

    filtered[normalizedKey] = value;
  }

  return filtered as T;
};
