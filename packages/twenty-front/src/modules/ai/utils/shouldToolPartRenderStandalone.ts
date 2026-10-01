import { type DynamicToolUIPart, type ToolUIPart } from 'ai';

import { type ToolWidget } from '@/ai/types/ToolWidget';

export const shouldToolPartRenderStandalone = (
  toolPart: ToolUIPart | DynamicToolUIPart,
  widget: ToolWidget | undefined,
): widget is ToolWidget => {
  if (widget === undefined) {
    return false;
  }

  // A record widget draws the call's output, so it has nothing to show before the call has run.
  if (widget.kind === 'builtin') {
    return toolPart.state === 'output-available';
  }

  // An app widget owns the whole call, approval and failure included, so it mounts once its input has settled.
  return toolPart.state !== 'input-streaming';
};
