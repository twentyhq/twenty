import {
  RemoteFragmentRenderer,
  createRemoteComponentRenderer,
} from '@remote-dom/react/host';
import { createHtmlHostWrapper } from '../utils/createHtmlHostWrapper';
import { RemoteStyleRenderer } from '../components/RemoteStyleRenderer';
type ComponentRegistryValue =
  | ReturnType<typeof createRemoteComponentRenderer>
  | typeof RemoteFragmentRenderer;

export const componentRegistry: Map<string, ComponentRegistryValue> = new Map([
  ['html-div', createRemoteComponentRenderer(createHtmlHostWrapper('div'))],
  ['html-span', createRemoteComponentRenderer(createHtmlHostWrapper('span'))],
  [
    'html-section',
    createRemoteComponentRenderer(createHtmlHostWrapper('section')),
  ],
  [
    'html-article',
    createRemoteComponentRenderer(createHtmlHostWrapper('article')),
  ],
  [
    'html-header',
    createRemoteComponentRenderer(createHtmlHostWrapper('header')),
  ],
  [
    'html-footer',
    createRemoteComponentRenderer(createHtmlHostWrapper('footer')),
  ],
  ['html-main', createRemoteComponentRenderer(createHtmlHostWrapper('main'))],
  ['html-nav', createRemoteComponentRenderer(createHtmlHostWrapper('nav'))],
  ['html-aside', createRemoteComponentRenderer(createHtmlHostWrapper('aside'))],
  ['html-p', createRemoteComponentRenderer(createHtmlHostWrapper('p'))],
  ['html-h1', createRemoteComponentRenderer(createHtmlHostWrapper('h1'))],
  ['html-h2', createRemoteComponentRenderer(createHtmlHostWrapper('h2'))],
  ['html-h3', createRemoteComponentRenderer(createHtmlHostWrapper('h3'))],
  ['html-h4', createRemoteComponentRenderer(createHtmlHostWrapper('h4'))],
  ['html-h5', createRemoteComponentRenderer(createHtmlHostWrapper('h5'))],
  ['html-h6', createRemoteComponentRenderer(createHtmlHostWrapper('h6'))],
  [
    'html-strong',
    createRemoteComponentRenderer(createHtmlHostWrapper('strong')),
  ],
  ['html-em', createRemoteComponentRenderer(createHtmlHostWrapper('em'))],
  ['html-small', createRemoteComponentRenderer(createHtmlHostWrapper('small'))],
  ['html-code', createRemoteComponentRenderer(createHtmlHostWrapper('code'))],
  ['html-pre', createRemoteComponentRenderer(createHtmlHostWrapper('pre'))],
  [
    'html-blockquote',
    createRemoteComponentRenderer(createHtmlHostWrapper('blockquote')),
  ],
  ['html-a', createRemoteComponentRenderer(createHtmlHostWrapper('a'))],
  ['html-img', createRemoteComponentRenderer(createHtmlHostWrapper('img'))],
  ['html-ul', createRemoteComponentRenderer(createHtmlHostWrapper('ul'))],
  ['html-ol', createRemoteComponentRenderer(createHtmlHostWrapper('ol'))],
  ['html-li', createRemoteComponentRenderer(createHtmlHostWrapper('li'))],
  ['html-form', createRemoteComponentRenderer(createHtmlHostWrapper('form'))],
  ['html-label', createRemoteComponentRenderer(createHtmlHostWrapper('label'))],
  ['html-input', createRemoteComponentRenderer(createHtmlHostWrapper('input'))],
  [
    'html-textarea',
    createRemoteComponentRenderer(createHtmlHostWrapper('textarea')),
  ],
  [
    'html-select',
    createRemoteComponentRenderer(createHtmlHostWrapper('select')),
  ],
  [
    'html-option',
    createRemoteComponentRenderer(createHtmlHostWrapper('option')),
  ],
  [
    'html-button',
    createRemoteComponentRenderer(createHtmlHostWrapper('button')),
  ],
  ['html-table', createRemoteComponentRenderer(createHtmlHostWrapper('table'))],
  ['html-thead', createRemoteComponentRenderer(createHtmlHostWrapper('thead'))],
  ['html-tbody', createRemoteComponentRenderer(createHtmlHostWrapper('tbody'))],
  ['html-tfoot', createRemoteComponentRenderer(createHtmlHostWrapper('tfoot'))],
  ['html-tr', createRemoteComponentRenderer(createHtmlHostWrapper('tr'))],
  ['html-th', createRemoteComponentRenderer(createHtmlHostWrapper('th'))],
  ['html-td', createRemoteComponentRenderer(createHtmlHostWrapper('td'))],
  ['html-br', createRemoteComponentRenderer(createHtmlHostWrapper('br'))],
  ['html-hr', createRemoteComponentRenderer(createHtmlHostWrapper('hr'))],
  ['remote-style', createRemoteComponentRenderer(RemoteStyleRenderer)],
  ['remote-fragment', RemoteFragmentRenderer],
]);
