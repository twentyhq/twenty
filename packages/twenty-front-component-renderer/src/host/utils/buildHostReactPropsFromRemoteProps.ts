import { isFunction, isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { DOM_EVENT_TYPE_TO_REACT_PROP } from '@/constants/DomEventTypeToReactProp';
import { hasDangerousUrlScheme } from '@/host/utils/hasDangerousUrlScheme';
import { isEventHandlerKey } from '@/host/utils/isEventHandlerKey';
import { isNavigationUrlAttribute } from '@/host/utils/isNavigationUrlAttribute';
import { parseCssString } from '@/host/utils/parseCssString';
import { wrapEventHandler } from '@/host/utils/wrapEventHandler';
import { type SerializedEventData } from '@/types/SerializedEventData';

const INTERNAL_PROPS = new Set(['element', 'receiver', 'components']);

// remote-dom sends handler props under the React spelling, the DOM spelling or
// anything in between, so both are indexed: `dblclick` arrives as either
// `ondblclick` or `onDoubleClick`.
const LOWERCASE_EVENT_PROP_TO_REACT_PROP: Record<string, string> =
  Object.fromEntries(
    Object.entries(DOM_EVENT_TYPE_TO_REACT_PROP).flatMap(
      ([domEventType, reactProp]) => [
        [`on${domEventType}`, reactProp],
        [reactProp.toLowerCase(), reactProp],
      ],
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

    // A guest can put any property name on the wire via updateRemoteProperty,
    // so an unmapped handler name is dropped rather than forwarded: React binds
    // every camelCase on* prop it recognizes, allow-listed or not.
    if (isEventHandlerKey(remotePropName)) {
      const reactPropName =
        LOWERCASE_EVENT_PROP_TO_REACT_PROP[remotePropName.toLowerCase()];

      if (isDefined(reactPropName) && isFunction(remotePropValue)) {
        hostReactProps[reactPropName] = wrapEventHandler(
          remotePropValue as (detail: SerializedEventData) => void,
        );
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
