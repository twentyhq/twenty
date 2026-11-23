import { PassThrough } from 'node:stream';

import { writeMcpWebResponse } from 'src/engine/api/mcp/utils/write-mcp-web-response.util';

const buildResponseWriter = () => {
  const chunks: Buffer[] = [];
  const headers: Record<string, string> = {};
  const sent: { statusCode: number; jsonBody: unknown } = {
    statusCode: 200,
    jsonBody: undefined,
  };
  const stream = new PassThrough();

  stream.on('data', (chunk: Buffer) => chunks.push(chunk));

  const res = Object.assign(stream, {
    status: (statusCode: number) => {
      sent.statusCode = statusCode;
    },
    setHeader: (name: string, value: string) => {
      headers[name] = value;
    },
    json: (body: unknown) => {
      sent.jsonBody = body;
      stream.end();
    },
  });

  return { res, sent, headers, body: () => Buffer.concat(chunks).toString() };
};

const EVENT_STREAM =
  'event: message\ndata: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"t","progress":0,"total":1}}\n\nevent: message\ndata: {"jsonrpc":"2.0","id":1,"result":{}}\n\n';

const buildEventStreamResponse = () =>
  new Response(EVENT_STREAM, {
    headers: { 'content-type': 'text/event-stream' },
  });

describe('writeMcpWebResponse', () => {
  it('should stream the response to clients that accept event streams', async () => {
    const { res, sent, headers, body } = buildResponseWriter();

    await writeMcpWebResponse({
      response: buildEventStreamResponse(),
      res,
      isEventStreamAccepted: true,
    });

    expect(sent.statusCode).toBe(200);
    expect(headers['content-type']).toBe('text/event-stream');
    expect(body()).toBe(EVENT_STREAM);
  });

  it('should send only the final message as JSON to other clients', async () => {
    const { res, sent } = buildResponseWriter();

    await writeMcpWebResponse({
      response: buildEventStreamResponse(),
      res,
      isEventStreamAccepted: false,
    });

    expect(sent.jsonBody).toEqual({ jsonrpc: '2.0', id: 1, result: {} });
  });

  it('should pass JSON responses through with their status', async () => {
    const { res, sent, body } = buildResponseWriter();

    await writeMcpWebResponse({
      response: new Response('{"jsonrpc":"2.0","id":1,"error":{}}', {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
      res,
      isEventStreamAccepted: false,
    });

    expect(sent.statusCode).toBe(400);
    expect(body()).toBe('{"jsonrpc":"2.0","id":1,"error":{}}');
  });

  it('should end an empty response such as a notification acknowledgement', async () => {
    const { res, sent, body } = buildResponseWriter();

    await writeMcpWebResponse({
      response: new Response(null, { status: 202 }),
      res,
      isEventStreamAccepted: false,
    });

    expect(sent.statusCode).toBe(202);
    expect(body()).toBe('');
  });
});
