import { type FrontComponentToolCallStatus } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';

import { AiChatToolCallApprovalArgumentsEditor } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalArgumentsEditor';
import { AiChatToolFrontComponent } from '@/ai-chat/tool-calls/components/AiChatToolFrontComponent';
import { useFrontComponentIdByToolName } from '@/ai-chat/tool-calls/hooks/useFrontComponentIdByToolName';

type AiChatToolCallApprovalGenericArgumentsProps = {
  toolCallId: string;
  toolName: string;
  toolArguments: Record<string, unknown>;
  status: FrontComponentToolCallStatus;
  readonly: boolean;
  output?: Record<string, unknown>;
  errorText?: string;
  onArgumentsChange?: (toolArguments: Record<string, unknown> | null) => void;
};

export const AiChatToolCallApprovalGenericArguments = ({
  toolCallId,
  toolName,
  toolArguments,
  status,
  readonly,
  output,
  errorText,
  onArgumentsChange,
}: AiChatToolCallApprovalGenericArgumentsProps) => {
  const toolFrontComponentId = useFrontComponentIdByToolName().get(toolName);

  const argumentsEditor = (
    <AiChatToolCallApprovalArgumentsEditor
      defaultArguments={toolArguments}
      readonly={readonly}
      onChange={(nextToolArguments) => onArgumentsChange?.(nextToolArguments)}
    />
  );

  if (!isDefined(toolFrontComponentId)) {
    return argumentsEditor;
  }

  return (
    <AiChatToolFrontComponent
      frontComponentId={toolFrontComponentId}
      toolCall={{
        toolCallId,
        toolName,
        status,
        input: toolArguments,
        output,
        errorText,
      }}
      onToolCallArgumentsChange={onArgumentsChange}
      unavailableFallback={argumentsEditor}
      errorFallback={argumentsEditor}
    />
  );
};
