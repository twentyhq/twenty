import { getEffectiveToolName } from '@/ai/utils/getEffectiveToolName';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { PREVIEW_FRONT_COMPONENT_TOOL_NAME } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

export const shouldToolPartRenderStandalone = ({
  toolPart,
  frontComponentId,
  isFrontComponentPreviewEnabled = false,
}: {
  toolPart: ToolUIPart | DynamicToolUIPart;
  frontComponentId?: string;
  isFrontComponentPreviewEnabled?: boolean;
}): boolean =>
  (isDefined(frontComponentId) ||
    (isFrontComponentPreviewEnabled &&
      getEffectiveToolName(toolPart) === PREVIEW_FRONT_COMPONENT_TOOL_NAME)) &&
  toolPart.state !== 'input-streaming';
