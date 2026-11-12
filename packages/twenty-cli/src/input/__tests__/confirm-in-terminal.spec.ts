import type * as readlinePromises from 'node:readline/promises';
import { createInterface } from 'node:readline/promises';
import { PassThrough } from 'node:stream';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { confirmInTerminal } from '@/input/confirm-in-terminal';

vi.mock('node:readline/promises', () => ({ createInterface: vi.fn() }));

const { createInterface: createRealInterface } = await vi.importActual<
  typeof readlinePromises
>('node:readline/promises');

const createTerminal = () => {
  const terminal = createRealInterface({ input: new PassThrough() });
  const question = vi.spyOn(terminal, 'question');
  const close = vi.spyOn(terminal, 'close');

  vi.mocked(createInterface).mockReturnValue(terminal);

  return { terminal, question, close };
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
      const { question, close } = createTerminal();
      question.mockResolvedValue(answer);
      await expect(
        confirmInTerminal({
          question: 'Create companions?',
          signal: new AbortController().signal,
        }),
      ).resolves.toBe(expected);
      expect(question).toHaveBeenCalledWith('Create companions? [y/N] ', {
        signal: expect.any(AbortSignal),
      });
      expect(close).toHaveBeenCalledOnce();
    },
  );

  it.each(['SIGINT', 'close', 'abort'])(
    'returns cancellation when interrupted by %s',
    async (event) => {
      const { terminal, question, close } = createTerminal();
      const controller = new AbortController();
      question.mockImplementation(
        async (_question, { signal }) =>
          new Promise((_resolve, reject) => {
            signal?.addEventListener('abort', () => reject(signal.reason), {
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
      expect(close).toHaveBeenCalledOnce();
    },
  );
});
