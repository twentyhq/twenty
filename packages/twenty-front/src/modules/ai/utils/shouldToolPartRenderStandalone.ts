import { type DynamicToolUIPart, type ToolUIPart } from 'ai';

import { type ToolWidget } from '@/ai/types/ToolWidget';

type FrontComponentToolWidget = Extract<
  ToolWidget,
  { kind: 'front-component' }
>;

// Record results stay in the step group, since the answer cites the records that matter.
// An app widget owns the whole call, so it mounts on its own once its input has settled.
export const shouldToolPartRenderStandalone = (
  toolPart: ToolUIPart | DynamicToolUIPart,
  widget: ToolWidget | undefined,
): widget is FrontComponentToolWidget =>
  widget?.kind === 'front-component' && toolPart.state !== 'input-streaming';
