import { printTypescriptValue } from '@/cli/utilities/pull/print-typescript-value';
import { describe, expect, it } from 'vitest';

const evaluatePrinted = (printed: string): unknown =>
  new Function(`return (${printed});`)();

describe('printTypescriptValue', () => {
  it('should escape characters that would otherwise break the generated literal', () => {
    const value = {
      description: 'first\r\nsecond',
      separators: '  ',
      quoted: "Tim's",
      backslash: 'a\\b',
    };

    const printed = printTypescriptValue({ value });

    expect(printed).toContain("description: 'first\\r\\nsecond',");
    expect(printed).toContain("separators: '\\u2028\\u2029',");
    expect(evaluatePrinted(printed)).toEqual(value);
  });

  it('should keep a __proto__ key as an own property instead of setting the prototype', () => {
    const value: Record<string, unknown> = {};

    Object.defineProperty(value, '__proto__', {
      value: 'not-a-prototype',
      enumerable: true,
      writable: true,
      configurable: true,
    });

    const printed = printTypescriptValue({ value });

    expect(printed).toContain("['__proto__']: 'not-a-prototype',");

    const evaluated = evaluatePrinted(printed) as Record<string, unknown>;

    expect(Object.prototype.hasOwnProperty.call(evaluated, '__proto__')).toBe(
      true,
    );
    expect(Object.getPrototypeOf(evaluated)).toBe(Object.prototype);
  });

  it('should quote a key that is not a valid identifier', () => {
    expect(printTypescriptValue({ value: { 'fr-FR': 1 } })).toContain(
      "'fr-FR': 1,",
    );
  });

  it('should drop undefined properties and keep null ones', () => {
    expect(
      printTypescriptValue({ value: { kept: null, dropped: undefined } }),
    ).toBe('{\n  kept: null,\n}');
  });
});
