import {
  createRemoteComponentRenderer,
  RemoteFragmentRenderer,
} from '@remote-dom/react/host';
import { createElement, type ReactNode } from 'react';

type RemoteElementRendererProps = {
  type?: string;
  children?: ReactNode;
};

const RemoteElementRenderer = createRemoteComponentRenderer(
  ({ type = 'div', children }: RemoteElementRendererProps) =>
    createElement(type, null, children),
);

export const frontComponentRemoteDomComponents = new Map([
  ['remote-element', RemoteElementRenderer],
  ['remote-fragment', RemoteFragmentRenderer],
]);
