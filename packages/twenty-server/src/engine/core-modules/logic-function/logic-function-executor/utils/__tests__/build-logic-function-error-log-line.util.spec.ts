import { buildLogicFunctionErrorLogLine } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/build-logic-function-error-log-line.util';

describe('buildLogicFunctionErrorLogLine', () => {
  it('builds an error line carrying the error type as error code', () => {
    const line = buildLogicFunctionErrorLogLine({
      errorType: 'TypeError',
      errorMessage: "Cannot read properties of undefined (reading 'phone')",
      stackTrace: ['TypeError: boom', '    at handler (index.js:3:9)'],
    });

    expect(line).toMatchObject({
      level: 'ERROR',
      message:
        "TypeError: Cannot read properties of undefined (reading 'phone')",
      errorCode: 'TypeError',
      properties: {
        stackTrace: ['TypeError: boom', '    at handler (index.js:3:9)'],
      },
    });
    expect(line.timestamp).toBeInstanceOf(Date);
  });

  it('splits a string stack trace into lines', () => {
    const line = buildLogicFunctionErrorLogLine({
      errorType: 'Error',
      errorMessage: 'boom',
      stackTrace: 'Error: boom\n    at handler (index.js:1:1)',
    });

    expect(line.properties).toEqual({
      stackTrace: ['Error: boom', '    at handler (index.js:1:1)'],
    });
  });
});
