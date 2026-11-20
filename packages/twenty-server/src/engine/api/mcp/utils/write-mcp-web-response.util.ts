import { once } from 'node:events';

import { isDefined } from 'twenty-shared/utils';

import { type McpHttpResponseWriter } from 'src/engine/api/mcp/types/mcp-http-response-writer.type';
import { findJsonRpcResponseInEventStream } from 'src/engine/api/mcp/utils/find-json-rpc-response-in-event-stream.util';

const isEventStream = (response: Response) =>
  response.headers.get('content-type')?.startsWith('text/event-stream') ??
  false;

export const writeMcpWebResponse = async ({
  response,
  res,
  isEventStreamAccepted,
}: {
  response: Response;
  res: McpHttpResponseWriter;
  isEventStreamAccepted: boolean;
}): Promise<void> => {
  // Plain HTTP callers, such as the code interpreter's helper, expect a JSON body
  if (!isEventStreamAccepted && isEventStream(response)) {
    const message = findJsonRpcResponseInEventStream(await response.text());

    res.status(response.status);

    if (isDefined(message)) {
      res.json(message);
    } else {
      res.end();
    }

    return;
  }

  res.status(response.status);
  response.headers.forEach((value, name) => res.setHeader(name, value));

  if (!isDefined(response.body)) {
    res.end();

    return;
  }

  for await (const chunk of response.body) {
    if (!res.write(chunk)) {
      await Promise.race([once(res, 'drain'), once(res, 'close')]);
    }
  }

  res.end();
};
