import { logDebug } from '~/utils/logDebug';

describe('logDebug', () => {
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
  });

  it('should call console.debug with the provided message', () => {
    const debugMessage = 'Test debug message';

    logDebug(debugMessage);

    expect(consoleDebugSpy).toHaveBeenCalledWith(debugMessage, []);
    expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle optional parameters', () => {
    const debugMessage = 'Test debug message';
    const param1 = 'param1';
    const param2 = { key: 'value' };

    logDebug(debugMessage, param1, param2);

    expect(consoleDebugSpy).toHaveBeenCalledWith(debugMessage, [
      param1,
      param2,
    ]);
  });

  it('should handle no optional parameters', () => {
    const debugMessage = 'Test debug message';

    logDebug(debugMessage);

    expect(consoleDebugSpy).toHaveBeenCalledWith(debugMessage, []);
  });

  it('should handle null and undefined messages', () => {
    logDebug(null);
    expect(consoleDebugSpy).toHaveBeenCalledWith(null, []);

    logDebug(undefined);
    expect(consoleDebugSpy).toHaveBeenCalledWith(undefined, []);
  });
});
