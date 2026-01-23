import { convertHtmlPropsToReactProps } from '@/page-layout/widgets/front-component/utils/convertHtmlPropsToReactProps.util';
import {
  createRemoteComponentRenderer,
  type RemoteComponentRendererProps,
} from '@remote-dom/react/host';
import { type ComponentType, createElement, type ReactNode } from 'react';

type HtmlElementRendererProps = {
  children?: ReactNode;
  [key: string]: unknown;
};

const EVENT_PROP_NAMES = new Set([
  'onClick',
  'onChange',
  'onSubmit',
  'onInput',
  'onFocus',
  'onBlur',
  'onKeyDown',
  'onKeyUp',
  'onMouseEnter',
  'onMouseLeave',
]);

const wrapEventHandlers = (
  props: Record<string, unknown>,
): Record<string, unknown> => {
  const wrappedProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (EVENT_PROP_NAMES.has(key) && typeof value === 'function') {
      wrappedProps[key] = () => {
        (value as () => void)();
      };
    } else {
      wrappedProps[key] = value;
    }
  }

  return wrappedProps;
};

export const createHtmlElementRenderer = (tagName: string) =>
  createRemoteComponentRenderer(
    ({ children, ...props }: HtmlElementRendererProps) => {
      const reactProps = convertHtmlPropsToReactProps(props);
      const wrappedProps = wrapEventHandlers(reactProps);

      return createElement(tagName, wrappedProps, children);
    },
  ) as ComponentType<RemoteComponentRendererProps>;
