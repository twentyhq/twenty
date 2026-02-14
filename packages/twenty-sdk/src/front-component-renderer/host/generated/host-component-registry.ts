/*
 * _____                    _
 *|_   _|_      _____ _ __ | |_ _   _
 *  | | \ \ /\ / / _ \ '_ \| __| | | | Auto-generated file
 *  | |  \ V  V /  __/ | | | |_| |_| | Any edits to this will be overridden
 *  |_|   \_/\_/ \___|_| |_|\__|\__, |
 *                              |___/
 */

import React from 'react';
import {
  RemoteFragmentRenderer,
  createRemoteComponentRenderer,
} from '@remote-dom/react/host';
import { type SerializedEventData } from '../../../sdk/front-component-api/constants/SerializedEventData';
const INTERNAL_PROPS = new Set(['element', 'receiver', 'components']);

const EVENT_NAME_MAP: Record<string, string> = {
  onclick: 'onClick',
  ondblclick: 'onDoubleClick',
  onmousedown: 'onMouseDown',
  onmouseup: 'onMouseUp',
  onmouseover: 'onMouseOver',
  onmouseout: 'onMouseOut',
  onmouseenter: 'onMouseEnter',
  onmouseleave: 'onMouseLeave',
  onkeydown: 'onKeyDown',
  onkeyup: 'onKeyUp',
  onkeypress: 'onKeyPress',
  onfocus: 'onFocus',
  onblur: 'onBlur',
  onchange: 'onChange',
  oninput: 'onInput',
  onsubmit: 'onSubmit',
  onscroll: 'onScroll',
  onwheel: 'onWheel',
  oncontextmenu: 'onContextMenu',
  ondrag: 'onDrag',
};

const parseStyle = (
  styleString: string | undefined,
): React.CSSProperties | undefined => {
  if (!styleString || typeof styleString !== 'string') {
    return styleString as React.CSSProperties | undefined;
  }

  const style: Record<string, string> = {};
  const declarations = styleString.split(';').filter(Boolean);

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) continue;

    const property = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();

    const camelProperty = property.replace(/-([a-z])/g, (_, letter: string) =>
      letter.toUpperCase(),
    );
    style[camelProperty] = value;
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
      filtered.style = parseStyle(value as string | undefined);
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
const HtmlDivWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('div', filterProps(props), children);
};
const HtmlSpanWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('span', filterProps(props), children);
};
const HtmlSectionWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('section', filterProps(props), children);
};
const HtmlArticleWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('article', filterProps(props), children);
};
const HtmlHeaderWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('header', filterProps(props), children);
};
const HtmlFooterWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('footer', filterProps(props), children);
};
const HtmlMainWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('main', filterProps(props), children);
};
const HtmlNavWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('nav', filterProps(props), children);
};
const HtmlAsideWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('aside', filterProps(props), children);
};
const HtmlPWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('p', filterProps(props), children);
};
const HtmlH1Wrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('h1', filterProps(props), children);
};
const HtmlH2Wrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('h2', filterProps(props), children);
};
const HtmlH3Wrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('h3', filterProps(props), children);
};
const HtmlH4Wrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('h4', filterProps(props), children);
};
const HtmlH5Wrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('h5', filterProps(props), children);
};
const HtmlH6Wrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('h6', filterProps(props), children);
};
const HtmlStrongWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('strong', filterProps(props), children);
};
const HtmlEmWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('em', filterProps(props), children);
};
const HtmlSmallWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('small', filterProps(props), children);
};
const HtmlCodeWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('code', filterProps(props), children);
};
const HtmlPreWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('pre', filterProps(props), children);
};
const HtmlBlockquoteWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('blockquote', filterProps(props), children);
};
const HtmlAWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('a', filterProps(props), children);
};
const HtmlImgWrapper = ({
  children: _children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('img', filterProps(props));
};
const HtmlUlWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('ul', filterProps(props), children);
};
const HtmlOlWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('ol', filterProps(props), children);
};
const HtmlLiWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('li', filterProps(props), children);
};
const HtmlFormWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('form', filterProps(props), children);
};
const HtmlLabelWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('label', filterProps(props), children);
};
const HtmlInputWrapper = ({
  children: _children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('input', filterProps(props));
};
const HtmlTextareaWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('textarea', filterProps(props), children);
};
const HtmlSelectWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('select', filterProps(props), children);
};
const HtmlOptionWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('option', filterProps(props), children);
};
const HtmlButtonWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('button', filterProps(props), children);
};
const HtmlTableWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('table', filterProps(props), children);
};
const HtmlTheadWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('thead', filterProps(props), children);
};
const HtmlTbodyWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('tbody', filterProps(props), children);
};
const HtmlTfootWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('tfoot', filterProps(props), children);
};
const HtmlTrWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('tr', filterProps(props), children);
};
const HtmlThWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('th', filterProps(props), children);
};
const HtmlTdWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('td', filterProps(props), children);
};
const HtmlBrWrapper = ({
  children: _children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('br', filterProps(props));
};
const HtmlHrWrapper = ({
  children: _children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('hr', filterProps(props));
};
type ComponentRegistryValue =
  | ReturnType<typeof createRemoteComponentRenderer>
  | typeof RemoteFragmentRenderer;

export const componentRegistry: Map<string, ComponentRegistryValue> = new Map([
  ['html-div', createRemoteComponentRenderer(HtmlDivWrapper)],
  ['html-span', createRemoteComponentRenderer(HtmlSpanWrapper)],
  ['html-section', createRemoteComponentRenderer(HtmlSectionWrapper)],
  ['html-article', createRemoteComponentRenderer(HtmlArticleWrapper)],
  ['html-header', createRemoteComponentRenderer(HtmlHeaderWrapper)],
  ['html-footer', createRemoteComponentRenderer(HtmlFooterWrapper)],
  ['html-main', createRemoteComponentRenderer(HtmlMainWrapper)],
  ['html-nav', createRemoteComponentRenderer(HtmlNavWrapper)],
  ['html-aside', createRemoteComponentRenderer(HtmlAsideWrapper)],
  ['html-p', createRemoteComponentRenderer(HtmlPWrapper)],
  ['html-h1', createRemoteComponentRenderer(HtmlH1Wrapper)],
  ['html-h2', createRemoteComponentRenderer(HtmlH2Wrapper)],
  ['html-h3', createRemoteComponentRenderer(HtmlH3Wrapper)],
  ['html-h4', createRemoteComponentRenderer(HtmlH4Wrapper)],
  ['html-h5', createRemoteComponentRenderer(HtmlH5Wrapper)],
  ['html-h6', createRemoteComponentRenderer(HtmlH6Wrapper)],
  ['html-strong', createRemoteComponentRenderer(HtmlStrongWrapper)],
  ['html-em', createRemoteComponentRenderer(HtmlEmWrapper)],
  ['html-small', createRemoteComponentRenderer(HtmlSmallWrapper)],
  ['html-code', createRemoteComponentRenderer(HtmlCodeWrapper)],
  ['html-pre', createRemoteComponentRenderer(HtmlPreWrapper)],
  ['html-blockquote', createRemoteComponentRenderer(HtmlBlockquoteWrapper)],
  ['html-a', createRemoteComponentRenderer(HtmlAWrapper)],
  ['html-img', createRemoteComponentRenderer(HtmlImgWrapper)],
  ['html-ul', createRemoteComponentRenderer(HtmlUlWrapper)],
  ['html-ol', createRemoteComponentRenderer(HtmlOlWrapper)],
  ['html-li', createRemoteComponentRenderer(HtmlLiWrapper)],
  ['html-form', createRemoteComponentRenderer(HtmlFormWrapper)],
  ['html-label', createRemoteComponentRenderer(HtmlLabelWrapper)],
  ['html-input', createRemoteComponentRenderer(HtmlInputWrapper)],
  ['html-textarea', createRemoteComponentRenderer(HtmlTextareaWrapper)],
  ['html-select', createRemoteComponentRenderer(HtmlSelectWrapper)],
  ['html-option', createRemoteComponentRenderer(HtmlOptionWrapper)],
  ['html-button', createRemoteComponentRenderer(HtmlButtonWrapper)],
  ['html-table', createRemoteComponentRenderer(HtmlTableWrapper)],
  ['html-thead', createRemoteComponentRenderer(HtmlTheadWrapper)],
  ['html-tbody', createRemoteComponentRenderer(HtmlTbodyWrapper)],
  ['html-tfoot', createRemoteComponentRenderer(HtmlTfootWrapper)],
  ['html-tr', createRemoteComponentRenderer(HtmlTrWrapper)],
  ['html-th', createRemoteComponentRenderer(HtmlThWrapper)],
  ['html-td', createRemoteComponentRenderer(HtmlTdWrapper)],
  ['html-br', createRemoteComponentRenderer(HtmlBrWrapper)],
  ['html-hr', createRemoteComponentRenderer(HtmlHrWrapper)],
  ['remote-fragment', RemoteFragmentRenderer],
]);
