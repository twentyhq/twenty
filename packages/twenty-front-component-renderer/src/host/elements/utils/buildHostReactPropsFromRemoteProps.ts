import { isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { buildHostReactEventHandlerProp } from '@/host/elements/utils/buildHostReactEventHandlerProp';
import { hasDangerousUrlScheme } from '@/host/elements/utils/hasDangerousUrlScheme';
import { isNavigationUrlAttribute } from '@/host/elements/utils/isNavigationUrlAttribute';
import { parseCssString } from '@/host/elements/utils/parseCssString';
import { isEventHandlerKey } from '@/host/events/utils/isEventHandlerKey';
import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';

const INTERNAL_PROPS = new Set(['element', 'receiver', 'components', 'ref']);
const TOP_LAYER_INVOKER_PROP_NAMES = [
  'popover',
  'popovertarget',
  'popovertargetaction',
  'popovertargetelement',
  'command',
  'commandfor',
  'commandforelement',
  'interestfor',
  'interestforelement',
];
const RAW_MARKUP_PROP_NAMES = [
  'dangerouslysetinnerhtml',
  'innerhtml',
  'outerhtml',
];
const BLOCKED_REMOTE_PROP_NAMES = new Set([
  ...TOP_LAYER_INVOKER_PROP_NAMES,
  ...RAW_MARKUP_PROP_NAMES,
]);

export const buildHostReactPropsFromRemoteProps = ({
  remoteProps,
  htmlTag,
  findRemoteElementIdContainingNode,
}: {
  remoteProps: Record<string, unknown>;
  htmlTag: string;
  findRemoteElementIdContainingNode?: FindRemoteElementIdContainingNode;
}): Record<string, unknown> => {
  const hostReactProps: Record<string, unknown> = {};

  for (const [remotePropName, remotePropValue] of Object.entries(remoteProps)) {
    if (
      INTERNAL_PROPS.has(remotePropName) ||
      BLOCKED_REMOTE_PROP_NAMES.has(remotePropName.toLowerCase()) ||
      isUndefined(remotePropValue)
    ) {
      continue;
    }

    if (remotePropName === 'style') {
      hostReactProps.style = parseCssString(
        remotePropValue as string | undefined,
      );
      continue;
    }

    // A guest can put any property name on the wire, and React binds every on*
    // prop it recognizes, so unmapped handler names are dropped.
    if (isEventHandlerKey(remotePropName)) {
      const hostReactEventHandlerProp = buildHostReactEventHandlerProp({
        remoteProps,
        remotePropName,
        remotePropValue,
        findRemoteElementIdContainingNode,
      });

      if (isDefined(hostReactEventHandlerProp)) {
        hostReactProps[hostReactEventHandlerProp.reactPropName] =
          hostReactEventHandlerProp.hostEventHandler;
      }
      continue;
    }

    if (
      isNavigationUrlAttribute(htmlTag, remotePropName) &&
      hasDangerousUrlScheme(remotePropValue)
    ) {
      continue;
    }

    hostReactProps[remotePropName] = remotePropValue;
  }

  return hostReactProps;
};
