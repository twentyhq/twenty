import { isNonEmptyString } from '@sniptt/guards';
import React from 'react';

import { EVENT_TO_REACT } from '@/constants/EventToReact';
import { type SerializedEventData } from '@/constants/SerializedEventData';

const INTERNAL_PROPS = new Set(['element', 'receiver', 'components']);

const EVENT_NAME_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(EVENT_TO_REACT).map(([domEvent, reactProp]) => [
    `on${domEvent}`,
    reactProp,
  ]),
);

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

const parseCssString = (
  styleString: string | undefined,
): React.CSSProperties | undefined => {
  if (!isNonEmptyString(styleString)) {
    return styleString as React.CSSProperties | undefined;
  }

  const style: Record<string, string> = {};
  const declarations = styleString.split(';').filter(Boolean);

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) continue;

    const property = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();

    const isCssCustomProperty = property.startsWith('--');

    const key = isCssCustomProperty
      ? property
      : property.replace(/-([a-z])/g, (_, letter: string) =>
          letter.toUpperCase(),
        );

    style[key] = value;
  }

  return style;
};

const serializeEvent = (event: unknown): SerializedEventData => {
  if (!event || typeof event !== 'object') {
    return { type: 'unknown' };
  }

  const domEvent = event as Record<string, unknown>;
  const serialized: SerializedEventData = {
    type: typeof domEvent.type === 'string' ? domEvent.type : 'unknown',
  };

  if ('altKey' in domEvent) serialized.altKey = domEvent.altKey as boolean;
  if ('ctrlKey' in domEvent) serialized.ctrlKey = domEvent.ctrlKey as boolean;
  if ('metaKey' in domEvent) serialized.metaKey = domEvent.metaKey as boolean;
  if ('shiftKey' in domEvent)
    serialized.shiftKey = domEvent.shiftKey as boolean;

  if ('clientX' in domEvent) serialized.clientX = domEvent.clientX as number;
  if ('clientY' in domEvent) serialized.clientY = domEvent.clientY as number;
  if ('pageX' in domEvent) serialized.pageX = domEvent.pageX as number;
  if ('pageY' in domEvent) serialized.pageY = domEvent.pageY as number;
  if ('screenX' in domEvent) serialized.screenX = domEvent.screenX as number;
  if ('screenY' in domEvent) serialized.screenY = domEvent.screenY as number;
  if ('offsetX' in domEvent) serialized.offsetX = domEvent.offsetX as number;
  if ('offsetY' in domEvent) serialized.offsetY = domEvent.offsetY as number;
  if ('movementX' in domEvent)
    serialized.movementX = domEvent.movementX as number;
  if ('movementY' in domEvent)
    serialized.movementY = domEvent.movementY as number;
  if ('button' in domEvent) serialized.button = domEvent.button as number;
  if ('buttons' in domEvent) serialized.buttons = domEvent.buttons as number;

  if ('key' in domEvent) serialized.key = domEvent.key as string;
  if ('code' in domEvent) serialized.code = domEvent.code as string;
  if ('repeat' in domEvent) serialized.repeat = domEvent.repeat as boolean;

  if ('deltaX' in domEvent) serialized.deltaX = domEvent.deltaX as number;
  if ('deltaY' in domEvent) serialized.deltaY = domEvent.deltaY as number;
  if ('deltaZ' in domEvent) serialized.deltaZ = domEvent.deltaZ as number;
  if ('deltaMode' in domEvent)
    serialized.deltaMode = domEvent.deltaMode as number;

  const target = domEvent.target as Record<string, unknown> | undefined;
  if (target && typeof target === 'object') {
    if ('value' in target && typeof target.value === 'string') {
      serialized.value = target.value;
    }
    if ('checked' in target && typeof target.checked === 'boolean') {
      serialized.checked = target.checked;
    }
    if ('scrollTop' in target && typeof target.scrollTop === 'number') {
      serialized.scrollTop = target.scrollTop;
    }
    if ('scrollLeft' in target && typeof target.scrollLeft === 'number') {
      serialized.scrollLeft = target.scrollLeft;
    }
    if ('currentTime' in target && typeof target.currentTime === 'number') {
      serialized.currentTime = target.currentTime;
    }
    if ('duration' in target && typeof target.duration === 'number') {
      serialized.duration = target.duration;
    }
    if ('paused' in target && typeof target.paused === 'boolean') {
      serialized.paused = target.paused;
    }
    if ('ended' in target && typeof target.ended === 'boolean') {
      serialized.ended = target.ended;
    }
    if ('volume' in target && typeof target.volume === 'number') {
      serialized.volume = target.volume;
    }
    if ('muted' in target && typeof target.muted === 'boolean') {
      serialized.muted = target.muted;
    }
    if ('playbackRate' in target && typeof target.playbackRate === 'number') {
      serialized.playbackRate = target.playbackRate;
    }
  }

  return serialized;
};

const wrapEventHandler = (handler: (detail: SerializedEventData) => void) => {
  return (event: unknown) => {
    handler(serializeEvent(event));
  };
};

const filterProps = <T extends object>(props: T): T => {
  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (INTERNAL_PROPS.has(key) || value === undefined) continue;

    if (key === 'style') {
      filtered.style = parseCssString(value as string | undefined);
    } else {
      const normalizedKey = EVENT_NAME_MAP[key.toLowerCase()] || key;

      if (normalizedKey.startsWith('on') && typeof value === 'function') {
        filtered[normalizedKey] = wrapEventHandler(
          value as (detail: SerializedEventData) => void,
        );
      } else {
        filtered[normalizedKey] = value;
      }
    }
  }

  return filtered as T;
};

type WrapperProps = { children?: React.ReactNode } & Record<string, unknown>;

const FORCED_PROPS_BY_TAG: Record<string, Record<string, unknown>> = {
  iframe: { sandbox: '' },
};

const TEXT_LIKE_INPUT_TYPES = new Set([
  'text',
  'search',
  'url',
  'tel',
  'password',
  'email',
  'number',
  '',
]);

const isTextLikeInputType = (type: unknown): boolean => {
  const inputType = typeof type === 'string' ? type.toLowerCase() : '';
  return TEXT_LIKE_INPUT_TYPES.has(inputType);
};

type CaretPreservingElement = HTMLInputElement | HTMLTextAreaElement;

const syncValuePreservingCaret = (
  element: CaretPreservingElement,
  nextValue: string,
): void => {
  if (element.value === nextValue) return;

  const isFocused = document.activeElement === element;
  const start = isFocused ? element.selectionStart : null;
  const end = isFocused ? element.selectionEnd : null;

  element.value = nextValue;

  if (isFocused && start !== null && end !== null) {
    try {
      element.setSelectionRange(start, end);
    } catch {}
  }
};

const createCaretPreservingElement = (
  htmlTag: 'input' | 'textarea',
  reactProps: Record<string, unknown>,
  forcedProps: Record<string, unknown> | undefined,
) => {
  const { value, defaultValue, ...rest } = reactProps;
  const initialValue =
    typeof defaultValue === 'string'
      ? defaultValue
      : typeof value === 'string'
        ? value
        : undefined;

  return React.createElement(htmlTag, {
    ...rest,
    ...forcedProps,
    defaultValue: initialValue,
    ref: (node: CaretPreservingElement | null) => {
      if (node === null) return;
      if (typeof value === 'string') {
        syncValuePreservingCaret(node, value);
      }
    },
  });
};

export const createHtmlHostWrapper = (htmlTag: string) => {
  const forcedProps = FORCED_PROPS_BY_TAG[htmlTag];
  const isVoid = VOID_ELEMENTS.has(htmlTag);

  return ({ children, ...props }: WrapperProps) => {
    const reactProps = filterProps(props);

    if (htmlTag === 'textarea') {
      return createCaretPreservingElement(htmlTag, reactProps, forcedProps);
    }

    if (htmlTag === 'input' && isTextLikeInputType(reactProps.type)) {
      return createCaretPreservingElement(htmlTag, reactProps, forcedProps);
    }

    return React.createElement(
      htmlTag,
      { ...reactProps, ...forcedProps },
      isVoid ? undefined : children,
    );
  };
};
