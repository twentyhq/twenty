import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { CodeExecutionDisplay } from '@/ai-chat/message-content/components/CodeExecutionDisplay';
import { LazyMarkdownContent } from '@/ai-chat/message-content/components/LazyMarkdownRenderer';
import { AiChatCompactionIndicator } from '@/ai-chat/messages/components/AiChatCompactionIndicator';
import { AiChatToolPartRenderer } from '@/ai-chat/tool-calls/components/AiChatToolPartRenderer';

type AiChatMessagePartRendererProps = {
  part: ExtendedUIMessagePart;
  frontComponentIdByToolName: Map<string, string>;
  isStreaming: boolean;
  isUserMessage?: boolean;
};

export const AiChatMessagePartRenderer = ({
  part,
  frontComponentIdByToolName,
  isStreaming,
  isUserMessage,
}: AiChatMessagePartRendererProps) => {
  const displayMode = isUserMessage ? 'bubble' : 'chat';

  switch (part.type) {
    case 'text':
      return (
        <LazyMarkdownContent
          text={part.text}
          displayMode={isDefined(isUserMessage) ? displayMode : 'default'}
        />
      );
    case 'data-compaction':
      return <AiChatCompactionIndicator />;
    case 'data-code-execution':
      return (
        <CodeExecutionDisplay
          code={part.data.code}
          stdout={part.data.stdout}
          stderr={part.data.stderr}
          exitCode={part.data.exitCode}
          files={part.data.files}
          isRunning={
            part.data.state === 'running' || part.data.state === 'pending'
          }
        />
      );
    default:
      return isToolUIPart(part) ? (
        <AiChatToolPartRenderer
          toolPart={part}
          frontComponentIdByToolName={frontComponentIdByToolName}
          isStreaming={isStreaming}
        />
      ) : null;
  }
};
