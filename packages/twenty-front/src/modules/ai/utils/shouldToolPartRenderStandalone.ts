import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { isDefined } from 'twenty-shared/utils';

// Record results stay in the step group, since the answer cites the records that matter.
// An app widget owns the whole call, so it mounts on its own once its input has settled.
export const shouldToolPartRenderStandalone = (
  toolPart: ToolUIPart | DynamicToolUIPart,
  frontComponentId: string | undefined,
): boolean =>
  isDefined(frontComponentId) && toolPart.state !== 'input-streaming';
