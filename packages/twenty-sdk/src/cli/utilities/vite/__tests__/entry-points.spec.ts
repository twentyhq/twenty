import path from 'path';

import {
  buildRollupInput,
  extractFunctionEntryPoints,
  haveFunctionEntryPointsChanged,
} from '../entry-points';

describe('buildRollupInput', () => {
  const appPath = '/app';

  it('should return empty object for empty entry points', () => {
    const result = buildRollupInput(appPath, []);

    expect(result).toEqual({});
  });

  it('should convert single entry point to rollup input', () => {
    const entryPoints = ['src/app/hello.function.ts'];

    const result = buildRollupInput(appPath, entryPoints);

    expect(result).toEqual({
      'hello.function': path.join(appPath, 'src/app/hello.function.ts'),
    });
  });

  it('should convert multiple entry points to rollup input', () => {
    const entryPoints = [
      'src/app/hello.function.ts',
      'src/app/utils/greet.function.ts',
    ];

    const result = buildRollupInput(appPath, entryPoints);

    expect(result).toEqual({
      'hello.function': path.join(appPath, 'src/app/hello.function.ts'),
      'greet.function': path.join(appPath, 'src/app/utils/greet.function.ts'),
    });
  });

  it('should use filename without extension as chunk name', () => {
    const entryPoints = ['src/functions/my-custom-handler.ts'];

    const result = buildRollupInput(appPath, entryPoints);

    expect(result).toEqual({
      'my-custom-handler': path.join(
        appPath,
        'src/functions/my-custom-handler.ts',
      ),
    });
  });
});

describe('extractFunctionEntryPoints', () => {
  it('should return empty array for no functions', () => {
    const result = extractFunctionEntryPoints([]);

    expect(result).toEqual([]);
  });

  it('should extract handler paths from serverless functions', () => {
    const functions = [
      { handlerPath: 'src/app/hello.function.ts' },
      { handlerPath: 'src/app/goodbye.function.ts' },
    ];

    const result = extractFunctionEntryPoints(functions);

    expect(result).toEqual([
      'src/app/goodbye.function.ts',
      'src/app/hello.function.ts',
    ]);
  });

  it('should return sorted array', () => {
    const functions = [
      { handlerPath: 'src/app/zebra.function.ts' },
      { handlerPath: 'src/app/alpha.function.ts' },
      { handlerPath: 'src/app/middle.function.ts' },
    ];

    const result = extractFunctionEntryPoints(functions);

    expect(result).toEqual([
      'src/app/alpha.function.ts',
      'src/app/middle.function.ts',
      'src/app/zebra.function.ts',
    ]);
  });
});

describe('haveFunctionEntryPointsChanged', () => {
  it('should return true for empty current and non-empty new', () => {
    const current: string[] = [];
    const newPoints = ['src/app/hello.function.ts'];

    const result = haveFunctionEntryPointsChanged(current, newPoints);

    expect(result).toBe(true);
  });

  it('should return true for non-empty current and empty new', () => {
    const current = ['src/app/hello.function.ts'];
    const newPoints: string[] = [];

    const result = haveFunctionEntryPointsChanged(current, newPoints);

    expect(result).toBe(true);
  });

  it('should return false for identical arrays', () => {
    const current = ['src/app/alpha.function.ts', 'src/app/beta.function.ts'];
    const newPoints = [
      'src/app/alpha.function.ts',
      'src/app/beta.function.ts',
    ];

    const result = haveFunctionEntryPointsChanged(current, newPoints);

    expect(result).toBe(false);
  });

  it('should return true when an entry point is added', () => {
    const current = ['src/app/alpha.function.ts'];
    const newPoints = [
      'src/app/alpha.function.ts',
      'src/app/beta.function.ts',
    ];

    const result = haveFunctionEntryPointsChanged(current, newPoints);

    expect(result).toBe(true);
  });

  it('should return true when an entry point is removed', () => {
    const current = ['src/app/alpha.function.ts', 'src/app/beta.function.ts'];
    const newPoints = ['src/app/alpha.function.ts'];

    const result = haveFunctionEntryPointsChanged(current, newPoints);

    expect(result).toBe(true);
  });

  it('should return true when entry points differ in content', () => {
    const current = ['src/app/alpha.function.ts'];
    const newPoints = ['src/app/beta.function.ts'];

    const result = haveFunctionEntryPointsChanged(current, newPoints);

    expect(result).toBe(true);
  });

  it('should return false for both empty arrays', () => {
    const result = haveFunctionEntryPointsChanged([], []);

    expect(result).toBe(false);
  });
});
