import { readUIMessageStream, type UIMessageChunk } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const readStreamedAgentMessage = async (
  chunks: Record<string, unknown>[],
): Promise<ExtendedUIMessage | null> => {
  if (!isNonEmptyArray(chunks)) {
    return null;
  }

  const stream = new ReadableStream<UIMessageChunk>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk as UIMessageChunk));
      controller.close();
    },
  });

  let message: ExtendedUIMessage | null = null;

  for await (const snapshot of readUIMessageStream<ExtendedUIMessage>({
    stream,
  })) {
    message = snapshot;
  }

  return message;
};
