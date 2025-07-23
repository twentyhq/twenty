import { parseAgentStreamingChunk } from '../parseAgentStreamingChunk';

describe('parseAgentStreamingChunk', () => {
  let mockCallbacks: {
    onTextDelta: jest.Mock;
    onToolCall: jest.Mock;
    onError: jest.Mock;
    onParseError: jest.Mock;
  };

  beforeEach(() => {
    mockCallbacks = {
      onTextDelta: jest.fn(),
      onToolCall: jest.fn(),
      onError: jest.fn(),
      onParseError: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('valid event types', () => {
    it('should call onTextDelta for text-delta events', () => {
      const chunk = JSON.stringify({
        type: 'text-delta',
        message: 'Hello world',
      });

      parseAgentStreamingChunk(chunk, mockCallbacks);

      expect(mockCallbacks.onTextDelta).toHaveBeenCalledWith('Hello world');
      expect(mockCallbacks.onToolCall).not.toHaveBeenCalled();
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
      expect(mockCallbacks.onParseError).not.toHaveBeenCalled();
    });

    it('should call onToolCall for tool-call events', () => {
      const chunk = JSON.stringify({
        type: 'tool-call',
        message: 'Tool execution result',
      });

      parseAgentStreamingChunk(chunk, mockCallbacks);

      expect(mockCallbacks.onToolCall).toHaveBeenCalledWith(
        'Tool execution result',
      );
      expect(mockCallbacks.onTextDelta).not.toHaveBeenCalled();
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
      expect(mockCallbacks.onParseError).not.toHaveBeenCalled();
    });

    it('should call onError for error events', () => {
      const chunk = JSON.stringify({
        type: 'error',
        message: 'Something went wrong',
      });

      parseAgentStreamingChunk(chunk, mockCallbacks);

      expect(mockCallbacks.onError).toHaveBeenCalledWith(
        'Something went wrong',
      );
      expect(mockCallbacks.onTextDelta).not.toHaveBeenCalled();
      expect(mockCallbacks.onToolCall).not.toHaveBeenCalled();
      expect(mockCallbacks.onParseError).not.toHaveBeenCalled();
    });
  });

  describe('multiple events in chunk', () => {
    it('should process multiple events separated by newlines', () => {
      const chunk = [
        JSON.stringify({ type: 'text-delta', message: 'First message' }),
        JSON.stringify({ type: 'tool-call', message: 'Tool result' }),
        JSON.stringify({ type: 'error', message: 'Error occurred' }),
      ].join('\n');

      parseAgentStreamingChunk(chunk, mockCallbacks);

      expect(mockCallbacks.onTextDelta).toHaveBeenCalledWith('First message');
      expect(mockCallbacks.onToolCall).toHaveBeenCalledWith('Tool result');
      expect(mockCallbacks.onError).toHaveBeenCalledWith('Error occurred');
      expect(mockCallbacks.onParseError).not.toHaveBeenCalled();
    });

    it('should skip empty lines', () => {
      const chunk = [
        JSON.stringify({ type: 'text-delta', message: 'First message' }),
        '',
        '   ',
        JSON.stringify({ type: 'tool-call', message: 'Tool result' }),
      ].join('\n');

      parseAgentStreamingChunk(chunk, mockCallbacks);

      expect(mockCallbacks.onTextDelta).toHaveBeenCalledWith('First message');
      expect(mockCallbacks.onToolCall).toHaveBeenCalledWith('Tool result');
      expect(mockCallbacks.onParseError).not.toHaveBeenCalled();
    });
  });

  describe('JSON parsing errors', () => {
    it('should call onParseError for invalid JSON', () => {
      const chunk = 'invalid json content';

      parseAgentStreamingChunk(chunk, mockCallbacks);

      expect(mockCallbacks.onParseError).toHaveBeenCalledWith(
        expect.any(Error),
        'invalid json content',
      );
      expect(mockCallbacks.onTextDelta).not.toHaveBeenCalled();
      expect(mockCallbacks.onToolCall).not.toHaveBeenCalled();
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
    });

    it('should call onParseError for malformed JSON', () => {
      const chunk = '{"type": "text-delta", "message": "unclosed quote}';

      parseAgentStreamingChunk(chunk, mockCallbacks);

      expect(mockCallbacks.onParseError).toHaveBeenCalledWith(
        expect.any(Error),
        '{"type": "text-delta", "message": "unclosed quote}',
      );
    });

    it('should handle mixed valid and invalid JSON in same chunk', () => {
      const chunk = [
        JSON.stringify({ type: 'text-delta', message: 'Valid message' }),
        'invalid json',
        JSON.stringify({ type: 'tool-call', message: 'Another valid message' }),
      ].join('\n');

      parseAgentStreamingChunk(chunk, mockCallbacks);

      expect(mockCallbacks.onTextDelta).toHaveBeenCalledWith('Valid message');
      expect(mockCallbacks.onToolCall).toHaveBeenCalledWith(
        'Another valid message',
      );
      expect(mockCallbacks.onParseError).toHaveBeenCalledWith(
        expect.any(Error),
        'invalid json',
      );
    });
  });

  describe('optional callbacks', () => {
    it('should not throw when callbacks are undefined', () => {
      const chunk = JSON.stringify({
        type: 'text-delta',
        message: 'Test message',
      });

      expect(() => {
        parseAgentStreamingChunk(chunk, {});
      }).not.toThrow();
    });

    it('should handle partial callback definitions', () => {
      const chunk = JSON.stringify({
        type: 'text-delta',
        message: 'Test message',
      });

      const partialCallbacks = {
        onTextDelta: jest.fn(),
      };

      parseAgentStreamingChunk(chunk, partialCallbacks);

      expect(partialCallbacks.onTextDelta).toHaveBeenCalledWith('Test message');
    });
  });

  describe('edge cases', () => {
    it('should handle empty chunk', () => {
      parseAgentStreamingChunk('', mockCallbacks);

      expect(mockCallbacks.onTextDelta).not.toHaveBeenCalled();
      expect(mockCallbacks.onToolCall).not.toHaveBeenCalled();
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
      expect(mockCallbacks.onParseError).not.toHaveBeenCalled();
    });

    it('should handle chunk with only whitespace', () => {
      parseAgentStreamingChunk('   \n\t\n  ', mockCallbacks);

      expect(mockCallbacks.onTextDelta).not.toHaveBeenCalled();
      expect(mockCallbacks.onToolCall).not.toHaveBeenCalled();
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
      expect(mockCallbacks.onParseError).not.toHaveBeenCalled();
    });

    it('should handle unknown event types gracefully', () => {
      const chunk = JSON.stringify({
        type: 'unknown-type',
        message: 'Unknown event',
      });

      parseAgentStreamingChunk(chunk, mockCallbacks);

      expect(mockCallbacks.onTextDelta).not.toHaveBeenCalled();
      expect(mockCallbacks.onToolCall).not.toHaveBeenCalled();
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
      expect(mockCallbacks.onParseError).not.toHaveBeenCalled();
    });
  });
});
