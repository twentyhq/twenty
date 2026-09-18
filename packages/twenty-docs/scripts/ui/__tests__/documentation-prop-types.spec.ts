import { describe, expect, it } from 'vitest';

import { normalizeDocumentationPropType } from '../../../../twenty-ui/docs/normalizeDocumentationPropType';

describe('documentation prop types', () => {
  it.each([
    [
      {
        type: {
          name: 'string | ((state: State) => string | undefined) | undefined',
        },
        required: false,
      },
      'string | ((state: State) => string | undefined)',
    ],
    [
      {
        type: {
          name: '((details: { trigger: Element | undefined; }) => void) | undefined',
        },
        required: false,
      },
      '((details: { trigger: Element | undefined; }) => void)',
    ],
    [
      { type: { name: 'Element | undefined' }, required: true },
      'Element | undefined',
    ],
    [{ type: { name: 'boolean' }, required: false }, 'boolean'],
    [
      {
        type: {
          name: 'enum',
          value: [{ value: '"sm"' }, { value: '"md"' }, { value: 'undefined' }],
        },
        required: false,
      },
      '"sm" | "md"',
    ],
    [
      {
        type: {
          name: 'enum',
          value: [{ value: '"sm"' }, { value: 'undefined' }],
        },
        required: true,
      },
      '"sm" | undefined',
    ],
  ])('normalizes %j to %j', (input, expected) => {
    expect(normalizeDocumentationPropType(input)).toBe(expected);
  });
});
