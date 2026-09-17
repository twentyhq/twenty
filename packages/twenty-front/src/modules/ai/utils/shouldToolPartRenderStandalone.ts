import { type DynamicToolUIPart, type ToolUIPart } from 'ai';

import { type ToolWidget } from '@/ai/types/tool-widget.type';

export const shouldToolPartRenderStandalone = (
  toolPart: ToolUIPart | DynamicToolUIPart,
  widget: ToolWidget | undefined,
): widget is ToolWidget => {
  if (widget === undefined) {
    return false;
  }

  // A record widget draws what the call returned, so it has nothing to show
  // before the call has run.
  if (widget.kind === 'builtin') {
    return toolPart.state === 'output-available';
  }

  // An app widget owns the whole call, approval and failure included, so it
  // mounts as soon as the input it renders has settled.
  return toolPart.state !== 'input-streaming';
};
