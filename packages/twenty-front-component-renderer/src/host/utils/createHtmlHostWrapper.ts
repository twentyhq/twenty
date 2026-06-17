import {
  isBoolean,
  isFunction,
  isNonEmptyString,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '@sniptt/guards';
import React, { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { EVENT_TO_REACT } from '@/constants/EventToReact';
import {
  type SerializedEventData,
  type SerializedFileData,
} from '@/constants/SerializedEventData';
import {
  FrontComponentInputFocusContext,
  type SetEditableFocused,
} from '@/host/contexts/FrontComponentInputFocusContext';
import { registerFrontComponentFile } from '@/host/utils/frontComponentFileRegistry';

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
      // Stash the real File on the host and hand the worker an opaque token it can
      // exchange for the bytes via the `readFrontComponentFile` host RPC. The bytes
      // themselves never cross here — only this handle does.
      token: registerFrontComponentFile(file),
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

  if (isNumber(domEvent.pointerId)) {
    serialized.pointerId = domEvent.pointerId;
  }
  if (isString(domEvent.pointerType)) {
    serialized.pointerType = domEvent.pointerType;
  }
  if (isNumber(domEvent.pressure)) {
    serialized.pressure = domEvent.pressure;
  }
  if (isNumber(domEvent.tangentialPressure)) {
    serialized.tangentialPressure = domEvent.tangentialPressure;
  }
  if (isNumber(domEvent.tiltX)) {
    serialized.tiltX = domEvent.tiltX;
  }
  if (isNumber(domEvent.tiltY)) {
    serialized.tiltY = domEvent.tiltY;
  }
  if (isNumber(domEvent.twist)) {
    serialized.twist = domEvent.twist;
  }
  if (isNumber(domEvent.width)) {
    serialized.width = domEvent.width;
  }
  if (isNumber(domEvent.height)) {
    serialized.height = domEvent.height;
  }
  if (isBoolean(domEvent.isPrimary)) {
    serialized.isPrimary = domEvent.isPrimary;
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

  // Drag-and-drop: dropped files live on event.dataTransfer.files, not on a form
  // target. Surface them through the same `files` channel so a component reads
  // e.target.files uniformly across the file-input and drop paths.
  if (!isDefined(serialized.files)) {
    const dataTransfer = domEvent.dataTransfer;
    if (isObject(dataTransfer)) {
      const droppedFiles = serializeFileList(
        (dataTransfer as Record<string, unknown>).files,
      );
      if (isDefined(droppedFiles) && droppedFiles.length > 0) {
        serialized.files = droppedFiles;
      }
    }
  }

  return serialized;
};

// A worker component can't preventDefault on the real host DOM event, so the host
// must do it for these: without preventDefault on dragenter/dragover the browser
// never fires `drop`, and without it on `drop` the browser navigates away to open
// the file. Preventing the default here is what makes a front-component a valid
// drop target at all.
const DRAG_EVENTS_TO_PREVENT_DEFAULT = new Set(['dragenter', 'dragover', 'drop']);

const wrapEventHandler = (handler: (detail: SerializedEventData) => void) => {
  return (event: unknown) => {
    if (isObject(event)) {
      const rawEvent = event as Record<string, unknown>;
      if (
        isString(rawEvent.type) &&
        DRAG_EVENTS_TO_PREVENT_DEFAULT.has(rawEvent.type) &&
        isFunction(rawEvent.preventDefault)
      ) {
        (rawEvent.preventDefault as () => void)();
      }
    }
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

// Host that is allowed to run scripts / same-origin inside an embedded iframe.
// WHY: Propel's in-sandbox Social tab embeds the Postiz calendar
// (https://postiz.remaxhub.ae/launches), which is a real app that needs scripts
// and same-origin to render. Every OTHER iframe stays locked to `sandbox=""`.
// To extend the allowlist, add more hosts here and widen the check in
// computeForcedIframeProps below — keep it host-exact, never a substring match.
const POSTIZ_EMBED_HOST = 'postiz.remaxhub.ae';

// The relaxed sandbox we grant ONLY to the allowlisted embed host. Intentionally
// the minimum Postiz needs; not `allow-top-navigation` or `allow-modals`.
const POSTIZ_EMBED_SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-popups';

const getIframeSrcHostname = (src: unknown): string | undefined => {
  if (!isNonEmptyString(src)) {
    return undefined;
  }
  try {
    return new URL(src).hostname;
  } catch {
    // Relative / invalid / non-absolute src — cannot trust it, fall through.
    return undefined;
  }
};

// Compute the iframe's forced props per-instance from its own `src`. Default is
// the strict `sandbox=''`; we only swap in the relaxed value when the src host
// EXACTLY matches the allowlisted embed host. Any parse failure or non-matching
// host keeps the strict sandbox.
const computeForcedIframeProps = (
  reactProps: Record<string, unknown>,
): Record<string, unknown> => {
  const hostname = getIframeSrcHostname(reactProps.src);
  const sandbox =
    hostname === POSTIZ_EMBED_HOST ? POSTIZ_EMBED_SANDBOX : '';
  return { sandbox };
};

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
  setEditableFocused: SetEditableFocused | null,
) => {
  const {
    value,
    defaultValue,
    onFocus: forwardedOnFocus,
    onBlur: forwardedOnBlur,
    ...rest
  } = reactProps;
  const initialValue = isNonEmptyString(defaultValue)
    ? defaultValue
    : isNonEmptyString(value)
      ? value
      : undefined;

  const handleFocus = (event: React.FocusEvent<CaretPreservingElement>) => {
    setEditableFocused?.(true);
    if (isFunction(forwardedOnFocus)) {
      forwardedOnFocus(event);
    }
  };

  const handleBlur = (event: React.FocusEvent<CaretPreservingElement>) => {
    setEditableFocused?.(false);
    if (isFunction(forwardedOnBlur)) {
      forwardedOnBlur(event);
    }
  };

  return React.createElement(htmlTag, {
    ...rest,
    ...forcedProps,
    defaultValue: initialValue,
    onFocus: handleFocus,
    onBlur: handleBlur,
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
  const staticForcedProps = FORCED_PROPS_BY_TAG[htmlTag];
  const isVoid = VOID_ELEMENTS.has(htmlTag);
  const isIframe = htmlTag === 'iframe';

  return ({ children, ...props }: WrapperProps) => {
    const setEditableFocused = useContext(FrontComponentInputFocusContext);
    const reactProps = filterProps(props);

    // iframe's forced sandbox is per-instance: strict `''` unless the src host is
    // the allowlisted embed host. Every other tag keeps its static forced props.
    const forcedProps = isIframe
      ? computeForcedIframeProps(reactProps)
      : staticForcedProps;

    if (
      htmlTag === 'textarea' ||
      (htmlTag === 'input' && isTextLikeInputType(reactProps.type))
    ) {
      return createCaretPreservingElement(
        htmlTag,
        reactProps,
        forcedProps,
        setEditableFocused,
      );
    }

    return React.createElement(
      htmlTag,
      { ...reactProps, ...forcedProps },
      isVoid ? undefined : children,
    );
  };
};
