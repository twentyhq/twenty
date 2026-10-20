import {
  RemoteFragmentRenderer,
  createRemoteComponentRenderer,
} from '@remote-dom/react/host';
import { isDefined } from 'twenty-shared/utils';

import { DENY_LISTED_REMOTE_ELEMENT_TAGS } from '@/host/constants/DenyListedRemoteElementTags';

type ComponentRegistryValue =
  | ReturnType<typeof createRemoteComponentRenderer>
  | typeof RemoteFragmentRenderer;

const RenderNothingComponent = createRemoteComponentRenderer(() => null);
const RenderChildrenOnlyComponent = RemoteFragmentRenderer;
const READ_ONLY_TAGS = new Set([
  'div',
  'span',
  'section',
  'article',
  'header',
  'footer',
  'main',
  'nav',
  'aside',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'strong',
  'em',
  'small',
  'code',
  'pre',
  'blockquote',
  'br',
  'hr',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'td',
  'th',
  'caption',
  'button',
  'input',
  'textarea',
  'label',
  'select',
  'option',
  'optgroup',
  'fieldset',
  'legend',
  'svg',
  'g',
  'path',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'rect',
  'title',
  'desc',
  'remote-fragment',
]);

const getNormalizedTagName = (tag: string): string =>
  tag.toLowerCase().replace(/^(html-)+/, '');

export const createFallbackComponentRegistry = (
  baseRegistry: Map<string, ComponentRegistryValue>,
  readOnly = false,
): Map<string, ComponentRegistryValue> => {
  const registryWithFallback = new Map(baseRegistry);
  const getRegisteredComponentForTag =
    Map.prototype.get.bind(registryWithFallback);

  registryWithFallback.get = (
    tag: string,
  ): ComponentRegistryValue | undefined => {
    if (readOnly && !READ_ONLY_TAGS.has(getNormalizedTagName(tag))) {
      return RenderChildrenOnlyComponent;
    }
    const directlyRegisteredComponent = getRegisteredComponentForTag(tag);
    if (isDefined(directlyRegisteredComponent)) {
      return directlyRegisteredComponent;
    }

    const normalizedTagName = getNormalizedTagName(tag);

    const safeWrapperComponent = getRegisteredComponentForTag(
      `html-${normalizedTagName}`,
    );
    if (isDefined(safeWrapperComponent)) {
      return safeWrapperComponent;
    }

    if (DENY_LISTED_REMOTE_ELEMENT_TAGS.has(normalizedTagName)) {
      return RenderNothingComponent;
    }

    return RenderChildrenOnlyComponent;
  };

  return registryWithFallback;
};
