import { getFunctionInputFromSourceCode } from '@/serverless-functions/utils/getFunctionInputFromSourceCode';

describe('getFunctionInputFromSourceCode', () => {
  it('should return empty input if not parameter', () => {
    const fileContent = 'function testFunction() { return }';
    const result = getFunctionInputFromSourceCode(fileContent);
    expect(result).toEqual({});
  });
  it('should return first input if multiple parameters', () => {
    const fileContent =
      'function testFunction(params1: {}, params2: {}) { return }';
    const result = getFunctionInputFromSourceCode(fileContent);
    expect(result).toEqual({});
  });
  it('should return empty input if wrong parameter', () => {
    const fileContent = 'function testFunction(params: string) { return }';
    const result = getFunctionInputFromSourceCode(fileContent);
    expect(result).toEqual({});
  });
  it('should return input from source code', () => {
    const fileContent = `
        function testFunction(
          params: {
            param1: string;
            param2: number;
            param3: boolean;
            param4: object;
            param5: { subParam1: string };
            param6: "my" | "enum";
            param7: string[];
          }
        ): void {
          return
        }
      `;

    const result = getFunctionInputFromSourceCode(fileContent);
    expect(result).toEqual({
      param1: null,
      param2: null,
      param3: null,
      param4: {},
      param5: {
        subParam1: null,
      },
      param6: 'my',
      param7: [],
    });
  });
});
