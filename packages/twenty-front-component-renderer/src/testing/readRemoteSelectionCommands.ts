import { type RemoteElementSerialization } from '@remote-dom/core';
import { serializeRemoteNode } from '@remote-dom/core/elements';

import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';

export const readRemoteSelectionCommands = (
  remoteControl: HTMLInputElement | HTMLTextAreaElement,
) =>
  (serializeRemoteNode(remoteControl) as RemoteElementSerialization)
    .properties?.[INPUT_SELECTION_BRIDGE_PROPERTIES.request];
