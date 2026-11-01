import { getEffectiveToolName } from '@/ai/utils/getEffectiveToolName';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { isDefined } from 'twenty-shared/utils';

// Record results stay in the step group, since the answer cites the records that matter.
// An app widget owns the whole call, so it mounts on its own once its input has settled.
export const shouldToolPartRenderStandalone = (
  toolPart: ToolUIPart | DynamicToolUIPart,
  frontComponentId: string | undefined,
  isFrontComponentPreviewEnabled = false,
): boolean =>
  (isDefined(frontComponentId) ||
    (isFrontComponentPreviewEnabled &&
      getEffectiveToolName(toolPart) === 'preview_front_component')) &&
  toolPart.state !== 'input-streaming';
