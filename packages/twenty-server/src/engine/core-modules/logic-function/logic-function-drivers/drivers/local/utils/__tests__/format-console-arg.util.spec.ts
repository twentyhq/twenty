import { formatConsoleArg } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/format-console-arg.util';

describe('formatConsoleArg', () => {
  it('returns primitives unchanged', () => {
    expect(formatConsoleArg('hello')).toBe('hello');
    expect(formatConsoleArg(42)).toBe(42);
    expect(formatConsoleArg(null)).toBeNull();
  });

  it('serialises plain objects to indented JSON', () => {
    expect(formatConsoleArg({ a: 1, b: 'x' })).toBe(
      JSON.stringify({ a: 1, b: 'x' }, null, 2),
    );
  });

  it('replaces circular references with "[Circular]" instead of throwing', () => {
    const root: { name: string; self?: unknown } = { name: 'root' };

    root.self = root;

    const formatted = formatConsoleArg(root);

    expect(typeof formatted).toBe('string');
    expect(formatted as string).toContain('"[Circular]"');
  });
});
