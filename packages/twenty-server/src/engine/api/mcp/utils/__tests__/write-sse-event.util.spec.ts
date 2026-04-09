import { writeSseEvent } from 'src/engine/api/mcp/utils/write-sse-event.util';

const createMockResponse = (headersSent = false) => ({
  write: jest.fn(),
  setHeader: jest.fn(),
  headersSent,
});

describe('writeSseEvent', () => {
  it('should write correctly formatted SSE event', () => {
    const mockResponse = createMockResponse() as any;
    const data = { jsonrpc: '2.0', id: '123', result: { foo: 'bar' } };

    writeSseEvent(mockResponse, data);

    expect(mockResponse.write).toHaveBeenCalledTimes(1);
    expect(mockResponse.write).toHaveBeenCalledWith(
      `event: message\ndata: ${JSON.stringify(data)}\n\n`,
    );
  });

  it('should produce wire format per HTML SSE spec', () => {
    const mockResponse = createMockResponse() as any;
    const data = { jsonrpc: '2.0', id: 1, result: {} };

    writeSseEvent(mockResponse, data);

    const written = mockResponse.write.mock.calls[0][0] as string;

    // Must start with "event: message\n"
    expect(written.startsWith('event: message\n')).toBe(true);
    // Must contain "data: " followed by valid JSON
    const dataLine = written.split('\n')[1];

    expect(dataLine).toBeDefined();
    expect(dataLine!.startsWith('data: ')).toBe(true);
    const parsed = JSON.parse(dataLine!.slice('data: '.length));

    expect(parsed).toEqual(data);
    // Must end with double newline to terminate the event
    expect(written.endsWith('\n\n')).toBe(true);
  });

  it('should set content-type headers when headers have not been sent', () => {
    const mockResponse = createMockResponse(false) as any;

    writeSseEvent(mockResponse, { jsonrpc: '2.0', id: '1', result: {} });

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/event-stream',
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-Content-Type-Options',
      'nosniff',
    );
  });

  it('should skip setting headers when headers have already been sent', () => {
    const mockResponse = createMockResponse(true) as any;

    writeSseEvent(mockResponse, { jsonrpc: '2.0', id: '1', result: {} });

    expect(mockResponse.setHeader).not.toHaveBeenCalled();
    expect(mockResponse.write).toHaveBeenCalledTimes(1);
  });
});
