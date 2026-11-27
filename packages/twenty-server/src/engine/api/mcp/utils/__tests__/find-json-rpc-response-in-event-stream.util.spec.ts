import { findJsonRpcResponseInEventStream } from 'src/engine/api/mcp/utils/find-json-rpc-response-in-event-stream.util';

describe('findJsonRpcResponseInEventStream', () => {
  it('should return the response that follows progress notifications', () => {
    const eventStream = [
      'event: message',
      'data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"t","progress":0,"total":1}}',
      '',
      'event: message',
      'data: {"jsonrpc":"2.0","id":7,"result":{"content":[],"isError":false}}',
      '',
      '',
    ].join('\n');

    expect(findJsonRpcResponseInEventStream(eventStream)).toEqual({
      jsonrpc: '2.0',
      id: 7,
      result: { content: [], isError: false },
    });
  });

  it('should return an error response', () => {
    expect(
      findJsonRpcResponseInEventStream(
        'event: message\ndata: {"jsonrpc":"2.0","id":1,"error":{"code":-32601,"message":"Method not found"}}\n\n',
      ),
    ).toEqual({
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32601, message: 'Method not found' },
    });
  });

  it('should join multi-line data and accept CRLF separators', () => {
    expect(
      findJsonRpcResponseInEventStream(
        'data: {"jsonrpc":"2.0",\r\ndata: "id":2,"result":{}}\r\n\r\n',
      ),
    ).toEqual({ jsonrpc: '2.0', id: 2, result: {} });
  });

  it('should return undefined when no event answers the request', () => {
    expect(
      findJsonRpcResponseInEventStream(': keep-alive\n\ndata: not json\n\n'),
    ).toBeUndefined();
  });
});
