import {
  RemoteFragmentRenderer,
  type RemoteComponentRendererMap,
  type RemoteComponentRendererProps,
} from '@remote-dom/react/host';

import { ALLOWED_HTML_ELEMENTS } from '@/page-layout/widgets/front-component/constants/AllowedHtmlElements';
import { createHtmlElementRenderer } from '@/page-layout/widgets/front-component/utils/createHtmlElementRenderer.util';
import { type ComponentType } from 'react';

const htmlElementRenderers: [
  string,
  ComponentType<RemoteComponentRendererProps>,
][] = ALLOWED_HTML_ELEMENTS.map((tagName) => [
  tagName,
  createHtmlElementRenderer(tagName),
]);

export const frontComponentRemoteDomComponents = new Map([
  ['remote-fragment', RemoteFragmentRenderer],
  ...htmlElementRenderers,
]) as RemoteComponentRendererMap;
