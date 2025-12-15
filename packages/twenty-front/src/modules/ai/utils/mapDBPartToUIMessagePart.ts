import { type ReasoningUIPart, type ToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { type AgentMessagePart } from '~/generated/graphql';

export const mapDBPartToUIMessagePart = (
  part: AgentMessagePart,
): ExtendedUIMessagePart => {
  switch (part.type) {
    case 'text':
      return {
        type: 'text',
        text: part.textContent!,
      };
    case 'reasoning':
      return {
        type: 'reasoning',
        text: part.reasoningContent!,
        state: part.state as ReasoningUIPart['state'],
      };
    case 'file':
      return {
        type: 'file',
        mediaType: part.fileMediaType!,
        filename: part.fileFilename!,
        url: part.fileUrl!,
      };
    case 'source-url':
      return {
        type: 'source-url',
        sourceId: part.sourceUrlSourceId!,
        url: part.sourceUrlUrl!,
        title: part.sourceUrlTitle!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case 'source-document':
      return {
        type: 'source-document',
        sourceId: part.sourceDocumentSourceId!,
        mediaType: part.sourceDocumentMediaType!,
        title: part.sourceDocumentTitle!,
        filename: part.sourceDocumentFilename!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case 'step-start':
      return {
        type: 'step-start',
      };
    case 'data-routing-status':
      return {
        type: part.type,
        data: {
          text: part.textContent!,
          state: part.state!,
        },
      };
    default:
      {
        if (part.type.includes('tool-') === true) {
          return {
            type: part.type as `tool-${string}`,
            toolCallId: part.toolCallId!,
            input: part.toolInput ?? {},
            output: part.toolOutput,
            errorText: part.errorMessage!,
            state: part.state,
          } as ToolUIPart;
        }
      }
      throw new Error(`Unsupported part type: ${part.type}`);
  }
};
