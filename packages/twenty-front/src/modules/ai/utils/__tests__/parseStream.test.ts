import { parseStream } from '../parseStream';

describe('parseStream', () => {
  describe('tool-call events', () => {
    it('should parse tool-call event correctly', () => {
      const streamText = JSON.stringify({
        type: 'tool-call',
        toolCallId: 'call-123',
        toolName: 'send_email',
        args: {
          loadingMessage: 'Sending email...',
          input: { to: 'test@example.com' },
        },
      });

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'tool',
        events: [
          {
            type: 'tool-call',
            toolCallId: 'call-123',
            toolName: 'send_email',
            args: {
              loadingMessage: 'Sending email...',
              input: { to: 'test@example.com' },
            },
          },
        ],
      });
    });
  });

  describe('tool-result events', () => {
    it('should parse tool-result event and append to existing tool entry', () => {
      const streamText = [
        JSON.stringify({
          type: 'tool-call',
          toolCallId: 'call-123',
          toolName: 'send_email',
          args: { loadingMessage: 'Sending email...', input: {} },
        }),
        JSON.stringify({
          type: 'tool-result',
          toolCallId: 'call-123',
          toolName: 'send_email',
          result: { sucess: true, result: 'Email sent', message: 'Success' },
          message: 'Email sent successfully',
        }),
      ].join('\n');

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'tool',
        events: [
          {
            type: 'tool-call',
            toolCallId: 'call-123',
            toolName: 'send_email',
            args: { loadingMessage: 'Sending email...', input: {} },
          },
          {
            type: 'tool-result',
            toolCallId: 'call-123',
            toolName: 'send_email',
            result: { sucess: true, result: 'Email sent', message: 'Success' },
            message: 'Email sent successfully',
          },
        ],
      });
    });

    it('should create new tool entry for orphaned tool-result', () => {
      const streamText = JSON.stringify({
        type: 'tool-result',
        toolCallId: 'call-456',
        toolName: 'http_request',
        result: {
          sucess: true,
          result: 'Response received',
          message: 'Success',
        },
        message: 'Request completed',
      });

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'tool',
        events: [
          {
            type: 'tool-result',
            toolCallId: 'call-456',
            toolName: 'http_request',
            result: {
              sucess: true,
              result: 'Response received',
              message: 'Success',
            },
            message: 'Request completed',
          },
        ],
      });
    });
  });

  describe('reasoning events', () => {
    it('should parse reasoning events correctly', () => {
      const streamText = [
        JSON.stringify({
          type: 'reasoning',
          textDelta: 'Let me think about this...',
        }),
        JSON.stringify({
          type: 'reasoning',
          textDelta: ' I need to consider the options.',
        }),
        JSON.stringify({ type: 'reasoning-signature' }),
      ].join('\n');

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'reasoning',
        content: 'Let me think about this... I need to consider the options.',
        isThinking: false,
      });
    });

    it('should handle reasoning without signature as thinking', () => {
      const streamText = JSON.stringify({
        type: 'reasoning',
        textDelta: 'Still thinking...',
      });

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'reasoning',
        content: 'Still thinking...',
        isThinking: true,
      });
    });

    it('should concatenate multiple reasoning deltas', () => {
      const streamText = [
        JSON.stringify({ type: 'reasoning', textDelta: 'First part' }),
        JSON.stringify({ type: 'reasoning', textDelta: ' second part' }),
        JSON.stringify({ type: 'reasoning', textDelta: ' third part' }),
      ].join('\n');

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'reasoning',
        content: 'First part second part third part',
        isThinking: true,
      });
    });
  });

  describe('text-delta events', () => {
    it('should parse text-delta events correctly', () => {
      const streamText = [
        JSON.stringify({ type: 'text-delta', textDelta: 'Hello, ' }),
        JSON.stringify({ type: 'text-delta', textDelta: 'world!' }),
      ].join('\n');

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'text',
        content: 'Hello, world!',
      });
    });

    it('should handle empty textDelta', () => {
      const streamText = JSON.stringify({ type: 'text-delta', textDelta: '' });

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'text',
        content: '',
      });
    });
  });

  describe('error events', () => {
    it('should parse error events correctly', () => {
      const streamText = JSON.stringify({
        type: 'error',
        message: 'Something went wrong',
        error: { code: 'TIMEOUT', details: 'Request timed out' },
      });

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'error',
        message: 'Something went wrong',
        error: { code: 'TIMEOUT', details: 'Request timed out' },
      });
    });

    it('should handle error without error details', () => {
      const streamText = JSON.stringify({
        type: 'error',
        message: 'Generic error',
      });

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'error',
        message: 'Generic error',
        error: undefined,
      });
    });

    it('should use default message when none provided', () => {
      const streamText = JSON.stringify({
        type: 'error',
      });

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'error',
        message: 'An error occurred',
        error: undefined,
      });
    });
  });

  describe('step-finish events', () => {
    it('should flush current text block on step-finish', () => {
      const streamText = [
        JSON.stringify({ type: 'text-delta', textDelta: 'Some text' }),
        JSON.stringify({ type: 'step-finish' }),
      ].join('\n');

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'text',
        content: 'Some text',
      });
    });

    it('should mark reasoning as not thinking on step-finish', () => {
      const streamText = [
        JSON.stringify({ type: 'reasoning', textDelta: 'Thinking...' }),
        JSON.stringify({ type: 'step-finish' }),
      ].join('\n');

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'reasoning',
        content: 'Thinking...',
        isThinking: false,
      });
    });
  });

  describe('mixed events', () => {
    it('should handle mixed event types correctly', () => {
      const streamText = [
        JSON.stringify({ type: 'text-delta', textDelta: 'Starting...' }),
        JSON.stringify({
          type: 'tool-call',
          toolCallId: 'call-1',
          toolName: 'send_email',
          args: { loadingMessage: 'Sending...', input: {} },
        }),
        JSON.stringify({ type: 'reasoning', textDelta: 'Let me think...' }),
        JSON.stringify({
          type: 'tool-result',
          toolCallId: 'call-1',
          toolName: 'send_email',
          result: { sucess: true, message: 'Done' },
          message: 'Email sent',
        }),
        JSON.stringify({ type: 'text-delta', textDelta: 'Finished!' }),
      ].join('\n');

      const result = parseStream(streamText);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ type: 'text', content: 'Starting...' });
      expect(result[1]).toEqual({
        type: 'tool',
        events: [
          {
            type: 'tool-call',
            toolCallId: 'call-1',
            toolName: 'send_email',
            args: { loadingMessage: 'Sending...', input: {} },
          },
          {
            type: 'tool-result',
            toolCallId: 'call-1',
            toolName: 'send_email',
            result: { sucess: true, message: 'Done' },
            message: 'Email sent',
          },
        ],
      });
      expect(result[2]).toEqual({
        type: 'reasoning',
        content: 'Let me think...',
        isThinking: true,
      });
      expect(result[3]).toEqual({
        type: 'text',
        content: 'Finished!',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty stream', () => {
      const result = parseStream('');
      expect(result).toEqual([]);
    });

    it('should handle whitespace-only stream', () => {
      const result = parseStream('   \n  \t  ');
      expect(result).toEqual([]);
    });

    it('should skip invalid JSON lines', () => {
      const streamText = [
        'invalid json line',
        JSON.stringify({ type: 'text-delta', textDelta: 'Valid content' }),
        'another invalid line',
      ].join('\n');

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'text',
        content: 'Valid content',
      });
    });

    it('should handle unknown event types', () => {
      const streamText = JSON.stringify({
        type: 'unknown-event',
        data: 'some data',
      });

      const result = parseStream(streamText);
      expect(result).toEqual([]);
    });

    it('should flush remaining text block at end', () => {
      const streamText = JSON.stringify({
        type: 'text-delta',
        textDelta: 'Unflushed content',
      });

      const result = parseStream(streamText);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'text',
        content: 'Unflushed content',
      });
    });
  });

  describe('text block transitions', () => {
    it('should create new text block when switching from reasoning to text', () => {
      const streamText = [
        JSON.stringify({ type: 'reasoning', textDelta: 'Thinking...' }),
        JSON.stringify({ type: 'text-delta', textDelta: 'Speaking...' }),
      ].join('\n');

      const result = parseStream(streamText);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        type: 'reasoning',
        content: 'Thinking...',
        isThinking: true,
      });
      expect(result[1]).toEqual({
        type: 'text',
        content: 'Speaking...',
      });
    });

    it('should create new reasoning block when switching from text to reasoning', () => {
      const streamText = [
        JSON.stringify({ type: 'text-delta', textDelta: 'Speaking...' }),
        JSON.stringify({ type: 'reasoning', textDelta: 'Thinking...' }),
      ].join('\n');

      const result = parseStream(streamText);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        type: 'text',
        content: 'Speaking...',
      });
      expect(result[1]).toEqual({
        type: 'reasoning',
        content: 'Thinking...',
        isThinking: true,
      });
    });
  });
});
