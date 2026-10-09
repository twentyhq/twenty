import { CliError } from '@/output/cli-error';
import { RESPONSE_BYTE_LIMIT } from '@/transport/constants/response-byte-limit.constant';

export async function* readEventStream({
  body,
  signal,
  frameByteLimit = RESPONSE_BYTE_LIMIT,
}: {
  body: ReadableStream<Uint8Array>;
  signal: AbortSignal;
  frameByteLimit?: number;
}) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let line = '';
  let event = '';
  let data: string[] = [];
  let frameBytes = 0;
  let skipLineFeed = false;

  const countBytes = (bytes: number) => {
    frameBytes += bytes;
    if (frameBytes > frameByteLimit) {
      throw new CliError({
        code: 'RESPONSE_LIMIT_EXCEEDED',
        message: `A log stream frame exceeds ${frameByteLimit} bytes.`,
        details: { byteLimit: frameByteLimit },
      });
    }
  };
  const cancel = () => {
    void reader.cancel().catch(() => undefined);
  };
  signal.addEventListener('abort', cancel, { once: true });

  try {
    signal.throwIfAborted();
    for (
      let chunk = await reader.read();
      !chunk.done;
      chunk = await reader.read()
    ) {
      signal.throwIfAborted();

      let start = 0;
      for (let index = 0; index < chunk.value.length; index += 1) {
        const byte = chunk.value[index];
        if (skipLineFeed) {
          skipLineFeed = false;
          if (byte === 10) {
            countBytes(1);
            start = index + 1;
            continue;
          }
        }
        if (byte !== 10 && byte !== 13) {
          continue;
        }

        countBytes(index - start + 1);
        line += decoder.decode(chunk.value.subarray(start, index), {
          stream: true,
        });
        line += decoder.decode();
        start = index + 1;
        skipLineFeed = byte === 13;

        if (line.length === 0) {
          const message = { event, data: data.join('\n') };
          event = '';
          data = [];
          frameBytes = 0;
          if (message.event.length > 0 || message.data.length > 0) {
            yield message;
            signal.throwIfAborted();
          }
        } else {
          const colon = line.indexOf(':');
          const field = colon === -1 ? line : line.slice(0, colon);
          const value =
            colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '');
          if (field === 'event') {
            event = value;
          } else if (field === 'data') {
            data.push(value);
          }
        }
        line = '';
      }

      countBytes(chunk.value.length - start);
      line += decoder.decode(chunk.value.subarray(start), { stream: true });
    }
    signal.throwIfAborted();
  } finally {
    signal.removeEventListener('abort', cancel);
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
