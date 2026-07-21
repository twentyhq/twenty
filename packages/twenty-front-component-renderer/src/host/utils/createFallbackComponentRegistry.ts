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

const getNormalizedTagName = (tag: string): string =>
  tag.toLowerCase().replace(/^(html-)+/, '');

export const createFallbackComponentRegistry = (
  baseRegistry: Map<string, ComponentRegistryValue>,
): Map<string, ComponentRegistryValue> => {
  const registryWithFallback = new Map(baseRegistry);
  const getRegisteredComponentForTag =
    Map.prototype.get.bind(registryWithFallback);

  registryWithFallback.get = (
    tag: string,
  ): ComponentRegistryValue | undefined => {
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
