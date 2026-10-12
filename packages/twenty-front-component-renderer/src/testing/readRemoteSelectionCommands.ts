import { type RemoteElementSerialization } from '@remote-dom/core';
import { serializeRemoteNode } from '@remote-dom/core/elements';

import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';
import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';

export const readRemoteSelectionCommands = (
  remoteControl: CaretPreservingElement,
) =>
  (serializeRemoteNode(remoteControl) as RemoteElementSerialization)
    .properties?.[INPUT_SELECTION_BRIDGE_PROPERTIES.request];
