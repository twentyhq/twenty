import { describe, expect, it } from 'vitest';

import { formatDocumentationTokenValue } from '../../../../twenty-ui/docs/formatDocumentationTokenValue';

describe('documentation token values', () => {
  it.each([
    [
      'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIYAAABQCA), url(data:image/jpeg;base64,/9j/4AAQ)',
      'url(data:image/png;base64,...), url(data:image/jpeg;base64,...)',
    ],
    [
      'color(display-p3 0.992 0.992 0.996)',
      'color(display-p3 0.992 0.992 0.996)',
    ],
    ['url(/noise.png)', 'url(/noise.png)'],
    ['16', '16'],
  ])('formats %s as %s', (value, expected) => {
    expect(formatDocumentationTokenValue(value)).toBe(expected);
  });
});
