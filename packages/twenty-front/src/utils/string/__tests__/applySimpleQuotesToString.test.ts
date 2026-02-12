import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';

describe('applySimpleQuotesToString', () => {
  it('wraps the input string with single quotes', () => {
    const input = 'Hello, World!';

    const result = applySimpleQuotesToString(input);

    expect(result).toBe(`'${input}'`);
  });
});
