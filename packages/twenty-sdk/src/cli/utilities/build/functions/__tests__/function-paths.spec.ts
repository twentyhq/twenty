import { computeFunctionOutputPath } from '../function-paths';

describe('computeFunctionOutputPath', () => {
  it('should handle function in src/app root', () => {
    const result = computeFunctionOutputPath('src/app/hello.function.ts');

    expect(result).toEqual({
      relativePath: 'hello.function.js',
      outputDir: '',
    });
  });

  it('should handle function in subdirectory', () => {
    const result = computeFunctionOutputPath('src/app/utils/greet.function.ts');

    expect(result).toEqual({
      relativePath: 'utils/greet.function.js',
      outputDir: 'utils',
    });
  });

  it('should handle deeply nested function', () => {
    const result = computeFunctionOutputPath(
      'src/app/modules/auth/handlers/login.function.ts',
    );

    expect(result).toEqual({
      relativePath: 'modules/auth/handlers/login.function.js',
      outputDir: 'modules/auth/handlers',
    });
  });

  it('should handle src/ prefix without app/', () => {
    const result = computeFunctionOutputPath('src/handlers/process.function.ts');

    expect(result).toEqual({
      relativePath: 'handlers/process.function.js',
      outputDir: 'handlers',
    });
  });

  it('should handle path without src/ prefix', () => {
    const result = computeFunctionOutputPath('handlers/webhook.function.ts');

    expect(result).toEqual({
      relativePath: 'handlers/webhook.function.js',
      outputDir: 'handlers',
    });
  });

  it('should normalize Windows path separators', () => {
    const result = computeFunctionOutputPath('src\\app\\utils\\greet.function.ts');

    expect(result).toEqual({
      relativePath: 'utils/greet.function.js',
      outputDir: 'utils',
    });
  });

  it('should change .ts extension to .js', () => {
    const result = computeFunctionOutputPath('src/app/test.function.ts');

    expect(result.relativePath.endsWith('.js')).toBe(true);
    expect(result.relativePath.endsWith('.ts')).toBe(false);
  });
});
