import { shouldKeepUnsavedSourceHandlerCode } from '@/logic-functions/utils/shouldKeepUnsavedSourceHandlerCode';

describe('shouldKeepUnsavedSourceHandlerCode', () => {
  it('does not keep anything when no code is waiting to be saved', () => {
    expect(
      shouldKeepUnsavedSourceHandlerCode({
        unsavedSourceHandlerCode: undefined,
        logicFunctionId: 'logic-function-id',
      }),
    ).toBe(false);
  });

  it('keeps code whose target is still being resolved', () => {
    expect(
      shouldKeepUnsavedSourceHandlerCode({
        unsavedSourceHandlerCode: { sourceHandlerCode: 'code' },
        logicFunctionId: 'logic-function-id',
      }),
    ).toBe(true);
  });

  it('keeps code saved to the displayed logic function', () => {
    expect(
      shouldKeepUnsavedSourceHandlerCode({
        unsavedSourceHandlerCode: {
          sourceHandlerCode: 'code',
          targetLogicFunctionId: 'logic-function-id',
        },
        logicFunctionId: 'logic-function-id',
      }),
    ).toBe(true);
  });

  it('does not keep code saved to another logic function', () => {
    expect(
      shouldKeepUnsavedSourceHandlerCode({
        unsavedSourceHandlerCode: {
          sourceHandlerCode: 'code',
          targetLogicFunctionId: 'other-logic-function-id',
        },
        logicFunctionId: 'logic-function-id',
      }),
    ).toBe(false);
  });
});
