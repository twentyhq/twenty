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
  [
    'html-iframe',
    createRemoteComponentRenderer(createHtmlHostWrapper('iframe')),
  ],
  ['html-video', createRemoteComponentRenderer(createHtmlHostWrapper('video'))],
  ['html-audio', createRemoteComponentRenderer(createHtmlHostWrapper('audio'))],
  [
    'html-source',
    createRemoteComponentRenderer(createHtmlHostWrapper('source')),
  ],
  ['html-b', createRemoteComponentRenderer(createHtmlHostWrapper('b'))],
  ['html-i', createRemoteComponentRenderer(createHtmlHostWrapper('i'))],
  ['html-u', createRemoteComponentRenderer(createHtmlHostWrapper('u'))],
  ['html-s', createRemoteComponentRenderer(createHtmlHostWrapper('s'))],
  ['html-mark', createRemoteComponentRenderer(createHtmlHostWrapper('mark'))],
  ['html-sub', createRemoteComponentRenderer(createHtmlHostWrapper('sub'))],
  ['html-sup', createRemoteComponentRenderer(createHtmlHostWrapper('sup'))],
  ['html-abbr', createRemoteComponentRenderer(createHtmlHostWrapper('abbr'))],
  ['html-cite', createRemoteComponentRenderer(createHtmlHostWrapper('cite'))],
  ['html-kbd', createRemoteComponentRenderer(createHtmlHostWrapper('kbd'))],
  ['html-samp', createRemoteComponentRenderer(createHtmlHostWrapper('samp'))],
  ['html-var', createRemoteComponentRenderer(createHtmlHostWrapper('var'))],
  ['html-dfn', createRemoteComponentRenderer(createHtmlHostWrapper('dfn'))],
  ['html-bdi', createRemoteComponentRenderer(createHtmlHostWrapper('bdi'))],
  ['html-bdo', createRemoteComponentRenderer(createHtmlHostWrapper('bdo'))],
  ['html-data', createRemoteComponentRenderer(createHtmlHostWrapper('data'))],
  ['html-del', createRemoteComponentRenderer(createHtmlHostWrapper('del'))],
  ['html-ins', createRemoteComponentRenderer(createHtmlHostWrapper('ins'))],
  ['html-q', createRemoteComponentRenderer(createHtmlHostWrapper('q'))],
  ['html-time', createRemoteComponentRenderer(createHtmlHostWrapper('time'))],
  ['html-ruby', createRemoteComponentRenderer(createHtmlHostWrapper('ruby'))],
  ['html-rt', createRemoteComponentRenderer(createHtmlHostWrapper('rt'))],
  ['html-rp', createRemoteComponentRenderer(createHtmlHostWrapper('rp'))],
  ['html-dl', createRemoteComponentRenderer(createHtmlHostWrapper('dl'))],
  ['html-dt', createRemoteComponentRenderer(createHtmlHostWrapper('dt'))],
  ['html-dd', createRemoteComponentRenderer(createHtmlHostWrapper('dd'))],
  [
    'html-figure',
    createRemoteComponentRenderer(createHtmlHostWrapper('figure')),
  ],
  [
    'html-figcaption',
    createRemoteComponentRenderer(createHtmlHostWrapper('figcaption')),
  ],
  [
    'html-details',
    createRemoteComponentRenderer(createHtmlHostWrapper('details')),
  ],
  [
    'html-summary',
    createRemoteComponentRenderer(createHtmlHostWrapper('summary')),
  ],
  [
    'html-address',
    createRemoteComponentRenderer(createHtmlHostWrapper('address')),
  ],
  [
    'html-dialog',
    createRemoteComponentRenderer(createHtmlHostWrapper('dialog')),
  ],
  [
    'html-hgroup',
    createRemoteComponentRenderer(createHtmlHostWrapper('hgroup')),
  ],
  [
    'html-search',
    createRemoteComponentRenderer(createHtmlHostWrapper('search')),
  ],
  [
    'html-caption',
    createRemoteComponentRenderer(createHtmlHostWrapper('caption')),
  ],
  [
    'html-colgroup',
    createRemoteComponentRenderer(createHtmlHostWrapper('colgroup')),
  ],
  ['html-col', createRemoteComponentRenderer(createHtmlHostWrapper('col'))],
  [
    'html-fieldset',
    createRemoteComponentRenderer(createHtmlHostWrapper('fieldset')),
  ],
  [
    'html-legend',
    createRemoteComponentRenderer(createHtmlHostWrapper('legend')),
  ],
  [
    'html-output',
    createRemoteComponentRenderer(createHtmlHostWrapper('output')),
  ],
  [
    'html-progress',
    createRemoteComponentRenderer(createHtmlHostWrapper('progress')),
  ],
  ['html-meter', createRemoteComponentRenderer(createHtmlHostWrapper('meter'))],
  [
    'html-optgroup',
    createRemoteComponentRenderer(createHtmlHostWrapper('optgroup')),
  ],
  [
    'html-datalist',
    createRemoteComponentRenderer(createHtmlHostWrapper('datalist')),
  ],
  [
    'html-picture',
    createRemoteComponentRenderer(createHtmlHostWrapper('picture')),
  ],
  ['html-track', createRemoteComponentRenderer(createHtmlHostWrapper('track'))],
  ['html-wbr', createRemoteComponentRenderer(createHtmlHostWrapper('wbr'))],
  ['html-menu', createRemoteComponentRenderer(createHtmlHostWrapper('menu'))],
  ['html-svg', createRemoteComponentRenderer(createHtmlHostWrapper('svg'))],
  ['html-g', createRemoteComponentRenderer(createHtmlHostWrapper('g'))],
  ['html-defs', createRemoteComponentRenderer(createHtmlHostWrapper('defs'))],
  [
    'html-symbol',
    createRemoteComponentRenderer(createHtmlHostWrapper('symbol')),
  ],
  ['html-use', createRemoteComponentRenderer(createHtmlHostWrapper('use'))],
  [
    'html-clippath',
    createRemoteComponentRenderer(createHtmlHostWrapper('clipPath')),
  ],
  ['html-mask', createRemoteComponentRenderer(createHtmlHostWrapper('mask'))],
  [
    'html-circle',
    createRemoteComponentRenderer(createHtmlHostWrapper('circle')),
  ],
  [
    'html-ellipse',
    createRemoteComponentRenderer(createHtmlHostWrapper('ellipse')),
  ],
  ['html-rect', createRemoteComponentRenderer(createHtmlHostWrapper('rect'))],
  ['html-line', createRemoteComponentRenderer(createHtmlHostWrapper('line'))],
  ['html-path', createRemoteComponentRenderer(createHtmlHostWrapper('path'))],
  [
    'html-polygon',
    createRemoteComponentRenderer(createHtmlHostWrapper('polygon')),
  ],
  [
    'html-polyline',
    createRemoteComponentRenderer(createHtmlHostWrapper('polyline')),
  ],
  ['html-text', createRemoteComponentRenderer(createHtmlHostWrapper('text'))],
  ['html-tspan', createRemoteComponentRenderer(createHtmlHostWrapper('tspan'))],
  [
    'html-lineargradient',
    createRemoteComponentRenderer(createHtmlHostWrapper('linearGradient')),
  ],
  [
    'html-radialgradient',
    createRemoteComponentRenderer(createHtmlHostWrapper('radialGradient')),
  ],
  ['html-stop', createRemoteComponentRenderer(createHtmlHostWrapper('stop'))],
  [
    'html-pattern',
    createRemoteComponentRenderer(createHtmlHostWrapper('pattern')),
  ],
  ['html-image', createRemoteComponentRenderer(createHtmlHostWrapper('image'))],
  [
    'html-foreignobject',
    createRemoteComponentRenderer(createHtmlHostWrapper('foreignObject')),
  ],
  [
    'html-marker',
    createRemoteComponentRenderer(createHtmlHostWrapper('marker')),
  ],
  ['html-title', createRemoteComponentRenderer(createHtmlHostWrapper('title'))],
  ['remote-style', createRemoteComponentRenderer(RemoteStyleRenderer)],
  ['remote-fragment', RemoteFragmentRenderer],
]);
