import { REMOTE_ELEMENT_PROP } from '@remote-dom/react/host';
import { isString } from '@sniptt/guards';

type RemoteElementPropCarrier = {
  [REMOTE_ELEMENT_PROP]?: { id?: unknown };
};

export const getRemoteElementIdFromProps = (
  props: Record<string, unknown>,
): string | undefined => {
  const remoteElement = (props as RemoteElementPropCarrier)[
    REMOTE_ELEMENT_PROP
  ];

  const remoteElementId = remoteElement?.id;

  return isString(remoteElementId) ? remoteElementId : undefined;
};
