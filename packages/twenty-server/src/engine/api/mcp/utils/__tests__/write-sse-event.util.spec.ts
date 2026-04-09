import { writeSseEvent } from 'src/engine/api/mcp/utils/write-sse-event.util';

describe('writeSseEvent', () => {
  it('should write correctly formatted SSE event', () => {
    const mockWrite = jest.fn();
    const mockResponse = { write: mockWrite } as any;
    const data = { jsonrpc: '2.0', id: '123', result: { foo: 'bar' } };

    writeSseEvent(mockResponse, data);

    expect(mockWrite).toHaveBeenCalledTimes(1);
    expect(mockWrite).toHaveBeenCalledWith(
      `event: message\ndata: ${JSON.stringify(data)}\n\n`,
    );
  });

  it('should produce wire format per HTML SSE spec', () => {
    const mockWrite = jest.fn();
    const mockResponse = { write: mockWrite } as any;
    const data = { jsonrpc: '2.0', id: 1, result: {} };

    writeSseEvent(mockResponse, data);

    const written = mockWrite.mock.calls[0][0] as string;

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
});
