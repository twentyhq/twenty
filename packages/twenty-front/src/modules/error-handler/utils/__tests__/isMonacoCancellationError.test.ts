import { isMonacoCancellationError } from '@/error-handler/utils/isMonacoCancellationError';

class MonacoCancellationError extends Error {
  constructor() {
    super('Canceled');
    this.name = this.message;
  }
}

describe('isMonacoCancellationError', () => {
  it('detects the error monaco rejects its cancelled promises with', () => {
    expect(isMonacoCancellationError(new MonacoCancellationError())).toBe(true);
  });

  it('ignores other errors carrying the same message', () => {
    expect(isMonacoCancellationError(new Error('Canceled'))).toBe(false);
    expect(isMonacoCancellationError(new TypeError('Canceled'))).toBe(false);
  });
});
