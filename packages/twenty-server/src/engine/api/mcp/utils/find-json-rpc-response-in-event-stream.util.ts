import { isPlainObject } from 'twenty-shared/utils';

const parseEventData = (event: string): unknown => {
  const data = event
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trimStart())
    .join('\n');

  try {
    return JSON.parse(data);
  } catch {
    return undefined;
  }
};

// Progress notifications precede the response; only the message answering the request is kept
export const findJsonRpcResponseInEventStream = (
  eventStream: string,
): Record<string, unknown> | undefined =>
  eventStream
    .split(/\r?\n\r?\n/)
    .map(parseEventData)
    .filter(isPlainObject)
    .reverse()
    .find((message) => 'result' in message || 'error' in message);
