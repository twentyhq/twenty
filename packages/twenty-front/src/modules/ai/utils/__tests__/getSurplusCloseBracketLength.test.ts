import { getSurplusCloseBracketLength } from '@/ai/utils/getSurplusCloseBracketLength';

describe('getSurplusCloseBracketLength', () => {
  it('should return zero when the closing tag is not followed by a bracket', () => {
    expect(
      getSurplusCloseBracketLength({
        textAfterClosing: ' next',
        openBracketLength: 2,
      }),
    ).toBe(0);
  });

  it('should return zero when a bracket is separated from the closing tag', () => {
    expect(
      getSurplusCloseBracketLength({
        textAfterClosing: ' ] next',
        openBracketLength: 2,
      }),
    ).toBe(0);
  });

  it('should count the brackets following the closing tag', () => {
    expect(
      getSurplusCloseBracketLength({
        textAfterClosing: ']. next',
        openBracketLength: 2,
      }),
    ).toBe(1);
  });

  it('should count no more brackets than the reference opened with', () => {
    expect(
      getSurplusCloseBracketLength({
        textAfterClosing: ']]] next',
        openBracketLength: 2,
      }),
    ).toBe(2);

    expect(
      getSurplusCloseBracketLength({
        textAfterClosing: ']]] next',
        openBracketLength: 3,
      }),
    ).toBe(3);
  });
});
