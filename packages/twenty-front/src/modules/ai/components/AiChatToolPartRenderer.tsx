import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { AiChatToolWidget } from '@/ai/components/AiChatToolWidget';
import { ToolRecordsWidget } from '@/ai/components/ToolRecordsWidget';
import { ToolStepRenderer } from '@/ai/components/ToolStepRenderer';
import { type ToolWidget } from '@/ai/types/tool-widget.type';
import { getToolOutputRecords } from '@/ai/utils/getToolOutputRecords';

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

  const records = getToolOutputRecords(toolPart);

  // A record tool that matched nothing, or failed, has no records to show and
  // reads better as the step row it has always been.
  if (!isNonEmptyArray(records)) {
    return <ToolStepRenderer toolPart={toolPart} isStreaming={isStreaming} />;
  }

  const output = toolPart.output as { message?: string } | undefined;

  return (
    <ToolRecordsWidget
      message={output?.message ?? ''}
      recordReferences={records}
    />
  );
};
