import { logError } from '~/utils/logError';

describe('logError', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should call console.error with the provided message', () => {
    const errorMessage = 'Test error message';

    logError(errorMessage);

    expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle object messages', () => {
    const errorObject = { error: 'Test error', code: 500 };

    logError(errorObject);

    expect(consoleErrorSpy).toHaveBeenCalledWith(errorObject);
  });

  it('should handle null and undefined messages', () => {
    logError(null);
    expect(consoleErrorSpy).toHaveBeenCalledWith(null);

    logError(undefined);
    expect(consoleErrorSpy).toHaveBeenCalledWith(undefined);
  });

  it('should handle Error objects', () => {
    const error = new Error('Test error');

    logError(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
  });
});
