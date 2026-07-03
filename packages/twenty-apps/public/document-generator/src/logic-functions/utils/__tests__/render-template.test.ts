import { describe, expect, it } from 'vitest';

import { flattenRecord, renderTemplate } from '../render-template';

describe('flattenRecord', () => {
  it('should flatten nested objects into dot paths', () => {
    const result = flattenRecord({
      name: { firstName: 'Ada', lastName: 'Lovelace' },
      jobTitle: 'Engineer',
    });

    expect(result).toEqual({
      'name.firstName': 'Ada',
      'name.lastName': 'Lovelace',
      jobTitle: 'Engineer',
    });
  });

  it('should coerce nullish leaves to empty strings', () => {
    const result = flattenRecord({ jobTitle: null, city: undefined });

    expect(result).toEqual({ jobTitle: '', city: '' });
  });

  it('should stringify number and boolean leaves', () => {
    const result = flattenRecord({ employees: 42, isActive: true });

    expect(result).toEqual({ employees: '42', isActive: 'true' });
  });
});

describe('renderTemplate', () => {
  it('should replace placeholders with matching values', () => {
    const result = renderTemplate('Hi {{name.firstName}}!', {
      'name.firstName': 'Ada',
    });

    expect(result.content).toBe('Hi Ada!');
    expect(result.missingTokens).toEqual([]);
  });

  it('should tolerate whitespace inside placeholders', () => {
    const result = renderTemplate('Hi {{ name.firstName }}', {
      'name.firstName': 'Ada',
    });

    expect(result.content).toBe('Hi Ada');
  });

  it('should render unknown placeholders as empty and report them', () => {
    const result = renderTemplate('Hi {{firstName}} from {{city}}', {
      firstName: 'Ada',
    });

    expect(result.content).toBe('Hi Ada from ');
    expect(result.missingTokens).toEqual(['city']);
  });

  it('should not report the same missing token twice', () => {
    const result = renderTemplate('{{x}} {{x}}', {});

    expect(result.missingTokens).toEqual(['x']);
  });
});
