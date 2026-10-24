import { isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { buildHostReactEventHandlerProp } from '@/host/elements/utils/buildHostReactEventHandlerProp';
import { hasDangerousUrlScheme } from '@/host/elements/utils/hasDangerousUrlScheme';
import { isNavigationUrlAttribute } from '@/host/elements/utils/isNavigationUrlAttribute';
import { parseCssString } from '@/host/elements/utils/parseCssString';
import { type ClaimPointerEventForwarding } from '@/host/events/types/ClaimPointerEventForwarding';
import { isEventHandlerKey } from '@/host/events/utils/isEventHandlerKey';
import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';

const INTERNAL_PROPS = new Set([
  'element',
  'receiver',
  'components',
  'ref',
  'dangerouslySetInnerHTML',
]);
const FORM_OWNER_ATTRIBUTE = 'form';
// The DOM lowercases attribute names, so any casing must reach the host's handling.
const HOST_SANITIZED_PROP_NAMES = new Set(['sandbox', 'style']);

const toHostPropName = (remotePropName: string): string => {
  const lowercasedPropName = remotePropName.toLowerCase();

  return HOST_SANITIZED_PROP_NAMES.has(lowercasedPropName)
    ? lowercasedPropName
    : remotePropName;
};

export const buildHostReactPropsFromRemoteProps = ({
  remoteProps,
  htmlTag,
  findRemoteElementIdContainingNode,
  claimPointerEventForwarding,
}: {
  remoteProps: Record<string, unknown>;
  htmlTag: string;
  findRemoteElementIdContainingNode?: FindRemoteElementIdContainingNode;
  claimPointerEventForwarding?: ClaimPointerEventForwarding;
}): Record<string, unknown> => {
  const hostReactProps: Record<string, unknown> = {};

  for (const [wirePropName, remotePropValue] of Object.entries(remoteProps)) {
    if (INTERNAL_PROPS.has(wirePropName) || isUndefined(remotePropValue)) {
      continue;
    }

    const remotePropName = toHostPropName(wirePropName);

    if (remotePropName.toLowerCase() === FORM_OWNER_ATTRIBUTE) {
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
        claimPointerEventForwarding,
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
