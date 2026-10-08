import { EventEmitter } from 'node:events';
import { createInterface } from 'node:readline/promises';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { confirmInTerminal } from '@/input/confirm-in-terminal';

vi.mock('node:readline/promises', () => ({ createInterface: vi.fn() }));

const createTerminal = () => {
  const terminal = Object.assign(new EventEmitter(), {
    question:
      vi.fn<
        (question: string, options: { signal: AbortSignal }) => Promise<string>
      >(),
    close: vi.fn(),
  });
  vi.mocked(createInterface).mockReturnValue(
    terminal as unknown as ReturnType<typeof createInterface>,
  );
  return terminal;
};

describe('terminal confirmation', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ['', false],
    ['n', false],
    ['no', false],
    ['y', true],
    [' YES ', true],
  ])(
    'defaults to No and accepts explicit Yes, answer=%j',
    async (answer, expected) => {
      const terminal = createTerminal();
      terminal.question.mockResolvedValue(answer);
      await expect(
        confirmInTerminal({
          question: 'Create companions?',
          signal: new AbortController().signal,
        }),
      ).resolves.toBe(expected);
      expect(terminal.question).toHaveBeenCalledWith(
        'Create companions? [y/N] ',
        { signal: expect.any(AbortSignal) },
      );
      expect(terminal.close).toHaveBeenCalledOnce();
    },
  );

  it.each(['SIGINT', 'close', 'abort'])(
    'returns cancellation when interrupted by %s',
    async (event) => {
      const terminal = createTerminal();
      const controller = new AbortController();
      terminal.question.mockImplementation(
        async (_question, { signal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason), {
              once: true,
            });
          }),
      );
      const result = confirmInTerminal({
        question: 'Create companions?',
        signal: controller.signal,
      });
      const assertion = expect(result).rejects.toMatchObject({
        code: 'CANCELLED',
        exitCode: 130,
      });
      if (event === 'abort') controller.abort();
      else terminal.emit(event);
      await assertion;
      expect(terminal.close).toHaveBeenCalledOnce();
    },
  );
});
