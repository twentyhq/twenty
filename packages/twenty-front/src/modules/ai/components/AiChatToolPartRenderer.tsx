import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { AiChatToolWidget } from '@/ai/components/AiChatToolWidget';
import { ToolRecordsWidget } from '@/ai/components/ToolRecordsWidget';
import { ToolStepRenderer } from '@/ai/components/ToolStepRenderer';
import { type ToolWidget } from '@/ai/types/tool-widget.type';
import { getToolRecordOutput } from '@/ai/utils/getToolRecordOutput';

type AiChatToolPartRendererProps = {
  toolPart: ToolUIPart | DynamicToolUIPart;
  widget: ToolWidget;
  isStreaming: boolean;
};

export const AiChatToolPartRenderer = ({
  toolPart,
  widget,
  isStreaming,
}: AiChatToolPartRendererProps) => {
  if (widget.kind === 'front-component') {
    return (
      <AiChatToolWidget
        toolPart={toolPart}
        frontComponentId={widget.frontComponentId}
        isStreaming={isStreaming}
      />
    );
  }

  const { message, recordReferences } = getToolRecordOutput(toolPart);

  // A record tool that matched nothing, or failed, has no records to show and
  // reads better as the step row it has always been.
  if (!isNonEmptyArray(recordReferences)) {
    return <ToolStepRenderer toolPart={toolPart} isStreaming={isStreaming} />;
  }

  return (
    <ToolRecordsWidget
      message={message ?? ''}
      recordReferences={recordReferences}
    />
  );
};
