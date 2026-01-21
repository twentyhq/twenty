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

export const createHtmlElementRenderer = (tagName: string) =>
  createRemoteComponentRenderer(
    ({ children, ...props }: HtmlElementRendererProps) => {
      const reactProps = convertHtmlPropsToReactProps(props);

      return createElement(tagName, reactProps, children);
    },
  ) as ComponentType<RemoteComponentRendererProps>;
