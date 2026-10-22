import { isNonEmptyString } from '@sniptt/guards';
import { getToolName, isToolUIPart } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type AgentRunEvent } from 'twenty-shared/application';

import { buildAgentRunMessageEvent } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-message-event.util';
import { buildAgentRunToolResultEvent } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-tool-result-event.util';
import { buildAgentRunToolUseEvent } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-tool-use-event.util';

const mapAgentMessageToAgentRunEvents = ({
  id: messageId,
  role,
  parts,
}: ExtendedUIMessage): AgentRunEvent[] => {
  if (role === 'system') {
    return [];
  }

  let textIndex = -1;

  return parts.flatMap((part): AgentRunEvent[] => {
    if (part.type === 'text') {
      textIndex += 1;

      return isNonEmptyString(part.text)
        ? [
            buildAgentRunMessageEvent({
              messageId,
              role,
              textIndex,
              text: part.text,
            }),
          ]
        : [];
    }

    if (!isToolUIPart(part)) {
      return [];
    }

    const toolUseEvent = buildAgentRunToolUseEvent({
      toolCallId: part.toolCallId,
      name: getToolName(part),
      input: part.input,
    });

    switch (part.state) {
      case 'output-available':
        return [
          toolUseEvent,
          buildAgentRunToolResultEvent({
            toolCallId: part.toolCallId,
            output: part.output,
            isError: false,
          }),
        ];
      case 'output-error':
        return [
          toolUseEvent,
          buildAgentRunToolResultEvent({
            toolCallId: part.toolCallId,
            output: part.errorText,
            isError: true,
          }),
        ];
      default:
        return [toolUseEvent];
    }
  });
};

export const mapAgentMessagesToAgentRunEvents = (
  messages: ExtendedUIMessage[],
): AgentRunEvent[] => messages.flatMap(mapAgentMessageToAgentRunEvents);
