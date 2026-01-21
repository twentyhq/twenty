import { computeFunctionOutputPath } from '../function-paths';

describe('computeFunctionOutputPath', () => {
  it('should handle function in src/app root', () => {
    const result = computeFunctionOutputPath('src/app/hello.function.ts');

    expect(result).toBe('hello.function.js');
  });

  it('should handle function in subdirectory', () => {
    const result = computeFunctionOutputPath('src/app/utils/greet.function.ts');

    expect(result).toBe('utils/greet.function.js');
  });

  it('should handle deeply nested function', () => {
    const result = computeFunctionOutputPath(
      'src/app/modules/auth/handlers/login.function.ts',
    );

    expect(result).toBe('modules/auth/handlers/login.function.js');
  });

  it('should handle src/ prefix without app/', () => {
    const result = computeFunctionOutputPath('src/handlers/process.function.ts');

    expect(result).toBe('handlers/process.function.js');
  });

  it('should handle path without src/ prefix', () => {
    const result = computeFunctionOutputPath('handlers/webhook.function.ts');

    expect(result).toBe('handlers/webhook.function.js');
  });

  it('should normalize Windows path separators', () => {
    const result = computeFunctionOutputPath('src\\app\\utils\\greet.function.ts');

    expect(result).toBe('utils/greet.function.js');
  });

  it('should change .ts extension to .js', () => {
    const result = computeFunctionOutputPath('src/app/test.function.ts');

    expect(result.endsWith('.js')).toBe(true);
    expect(result.endsWith('.ts')).toBe(false);
  });
});
