import { isFunction, isUndefined } from '@sniptt/guards';

import { DOM_EVENT_TYPE_TO_REACT_PROP } from '@/constants/DomEventTypeToReactProp';
import { hasDangerousUrlScheme } from '@/host/utils/hasDangerousUrlScheme';
import { isEventHandlerKey } from '@/host/utils/isEventHandlerKey';
import { isNavigationUrlAttribute } from '@/host/utils/isNavigationUrlAttribute';
import { parseCssString } from '@/host/utils/parseCssString';
import { wrapEventHandler } from '@/host/utils/wrapEventHandler';
import { type SerializedEventData } from '@/types/SerializedEventData';

const INTERNAL_PROPS = new Set(['element', 'receiver', 'components']);

const LOWERCASE_EVENT_PROP_TO_REACT_PROP: Record<string, string> =
  Object.fromEntries(
    Object.entries(DOM_EVENT_TYPE_TO_REACT_PROP).map(
      ([domEventType, reactProp]) => [`on${domEventType}`, reactProp],
    ),
  );

export const buildHostReactPropsFromRemoteProps = (
  remoteProps: Record<string, unknown>,
  htmlTag: string,
): Record<string, unknown> => {
  const hostReactProps: Record<string, unknown> = {};

  for (const [remotePropName, remotePropValue] of Object.entries(remoteProps)) {
    if (INTERNAL_PROPS.has(remotePropName) || isUndefined(remotePropValue)) {
      continue;
    }

    if (remotePropName === 'style') {
      hostReactProps.style = parseCssString(
        remotePropValue as string | undefined,
      );
      continue;
    }

    const reactPropName =
      LOWERCASE_EVENT_PROP_TO_REACT_PROP[remotePropName.toLowerCase()] ||
      remotePropName;

    if (isEventHandlerKey(reactPropName)) {
      if (isFunction(remotePropValue)) {
        hostReactProps[reactPropName] = wrapEventHandler(
          remotePropValue as (detail: SerializedEventData) => void,
        );
      }
      continue;
    }

    if (
      isNavigationUrlAttribute(htmlTag, reactPropName) &&
      hasDangerousUrlScheme(remotePropValue)
    ) {
      continue;
    }

    hostReactProps[reactPropName] = remotePropValue;
  }

  return hostReactProps;
};
