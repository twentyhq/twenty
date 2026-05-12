import {
  isBoolean,
  isFunction,
  isNonEmptyString,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '@sniptt/guards';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';

import { EVENT_TO_REACT } from '@/constants/EventToReact';
import {
  type SerializedEventData,
  type SerializedFileData,
} from '@/constants/SerializedEventData';

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
    if (colonIndex === -1) {
      continue;
    }

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

const serializeFileList = (
  files: unknown,
): SerializedFileData[] | undefined => {
  if (!isObject(files)) {
    return undefined;
  }
  const fileListLike = files as { length?: unknown } & Record<number, unknown>;
  if (!isNumber(fileListLike.length)) {
    return undefined;
  }

  const serialized: SerializedFileData[] = [];
  for (let index = 0; index < fileListLike.length; index++) {
    const file = fileListLike[index];
    if (!isObject(file)) {
      continue;
    }
    const fileRecord = file as Record<string, unknown>;
    if (
      !isString(fileRecord.name) ||
      !isNumber(fileRecord.size) ||
      !isString(fileRecord.type) ||
      !isNumber(fileRecord.lastModified)
    ) {
      continue;
    }
    serialized.push({
      name: fileRecord.name,
      size: fileRecord.size,
      type: fileRecord.type,
      lastModified: fileRecord.lastModified,
    });
  }

  return serialized;
};

const serializeEvent = (event: unknown): SerializedEventData => {
  if (!isObject(event)) {
    return { type: 'unknown' };
  }

  const domEvent = event as Record<string, unknown>;
  const serialized: SerializedEventData = {
    type: isString(domEvent.type) ? domEvent.type : 'unknown',
  };

  if (isBoolean(domEvent.altKey)) {
    serialized.altKey = domEvent.altKey;
  }
  if (isBoolean(domEvent.ctrlKey)) {
    serialized.ctrlKey = domEvent.ctrlKey;
  }
  if (isBoolean(domEvent.metaKey)) {
    serialized.metaKey = domEvent.metaKey;
  }
  if (isBoolean(domEvent.shiftKey)) {
    serialized.shiftKey = domEvent.shiftKey;
  }

  if (isNumber(domEvent.clientX)) {
    serialized.clientX = domEvent.clientX;
  }
  if (isNumber(domEvent.clientY)) {
    serialized.clientY = domEvent.clientY;
  }
  if (isNumber(domEvent.pageX)) {
    serialized.pageX = domEvent.pageX;
  }
  if (isNumber(domEvent.pageY)) {
    serialized.pageY = domEvent.pageY;
  }
  if (isNumber(domEvent.screenX)) {
    serialized.screenX = domEvent.screenX;
  }
  if (isNumber(domEvent.screenY)) {
    serialized.screenY = domEvent.screenY;
  }
  if (isNumber(domEvent.offsetX)) {
    serialized.offsetX = domEvent.offsetX;
  }
  if (isNumber(domEvent.offsetY)) {
    serialized.offsetY = domEvent.offsetY;
  }
  if (isNumber(domEvent.movementX)) {
    serialized.movementX = domEvent.movementX;
  }
  if (isNumber(domEvent.movementY)) {
    serialized.movementY = domEvent.movementY;
  }
  if (isNumber(domEvent.button)) {
    serialized.button = domEvent.button;
  }
  if (isNumber(domEvent.buttons)) {
    serialized.buttons = domEvent.buttons;
  }

  if (isString(domEvent.key)) {
    serialized.key = domEvent.key;
  }
  if (isString(domEvent.code)) {
    serialized.code = domEvent.code;
  }
  if (isBoolean(domEvent.repeat)) {
    serialized.repeat = domEvent.repeat;
  }

  if (isNumber(domEvent.deltaX)) {
    serialized.deltaX = domEvent.deltaX;
  }
  if (isNumber(domEvent.deltaY)) {
    serialized.deltaY = domEvent.deltaY;
  }
  if (isNumber(domEvent.deltaZ)) {
    serialized.deltaZ = domEvent.deltaZ;
  }
  if (isNumber(domEvent.deltaMode)) {
    serialized.deltaMode = domEvent.deltaMode;
  }

  const target = domEvent.target;
  if (isObject(target)) {
    const targetRecord = target as Record<string, unknown>;
    if (isString(targetRecord.value)) {
      serialized.value = targetRecord.value;
    }
    if (isBoolean(targetRecord.checked)) {
      serialized.checked = targetRecord.checked;
    }
    if (isNumber(targetRecord.scrollTop)) {
      serialized.scrollTop = targetRecord.scrollTop;
    }
    if (isNumber(targetRecord.scrollLeft)) {
      serialized.scrollLeft = targetRecord.scrollLeft;
    }
    if (isNumber(targetRecord.currentTime)) {
      serialized.currentTime = targetRecord.currentTime;
    }
    if (isNumber(targetRecord.duration)) {
      serialized.duration = targetRecord.duration;
    }
    if (isBoolean(targetRecord.paused)) {
      serialized.paused = targetRecord.paused;
    }
    if (isBoolean(targetRecord.ended)) {
      serialized.ended = targetRecord.ended;
    }
    if (isNumber(targetRecord.volume)) {
      serialized.volume = targetRecord.volume;
    }
    if (isBoolean(targetRecord.muted)) {
      serialized.muted = targetRecord.muted;
    }
    if (isNumber(targetRecord.playbackRate)) {
      serialized.playbackRate = targetRecord.playbackRate;
    }

    const files = serializeFileList(targetRecord.files);
    if (isDefined(files)) {
      serialized.files = files;
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
    if (INTERNAL_PROPS.has(key) || isUndefined(value)) {
      continue;
    }

    if (key === 'style') {
      filtered.style = parseCssString(value as string | undefined);
    } else {
      const normalizedKey = EVENT_NAME_MAP[key.toLowerCase()] || key;

      if (normalizedKey.startsWith('on') && isFunction(value)) {
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
  const inputType = isString(type) ? type.toLowerCase() : '';
  return TEXT_LIKE_INPUT_TYPES.has(inputType);
};

type CaretPreservingElement = HTMLInputElement | HTMLTextAreaElement;

const syncValuePreservingCaret = (
  element: CaretPreservingElement,
  nextValue: string,
): void => {
  if (element.value === nextValue) {
    return;
  }

  const isFocused = document.activeElement === element;
  const start = isFocused ? element.selectionStart : null;
  const end = isFocused ? element.selectionEnd : null;

  element.value = nextValue;

  if (isFocused && isDefined(start) && isDefined(end)) {
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
  const initialValue = isNonEmptyString(defaultValue)
    ? defaultValue
    : isNonEmptyString(value)
      ? value
      : undefined;

  return React.createElement(htmlTag, {
    ...rest,
    ...forcedProps,
    defaultValue: initialValue,
    ref: (node: CaretPreservingElement | null) => {
      if (!isDefined(node)) {
        return;
      }
      if (isNonEmptyString(value)) {
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

    if (
      htmlTag === 'textarea' ||
      (htmlTag === 'input' && isTextLikeInputType(reactProps.type))
    ) {
      return createCaretPreservingElement(htmlTag, reactProps, forcedProps);
    }

    return React.createElement(
      htmlTag,
      { ...reactProps, ...forcedProps },
      isVoid ? undefined : children,
    );
  };
};
