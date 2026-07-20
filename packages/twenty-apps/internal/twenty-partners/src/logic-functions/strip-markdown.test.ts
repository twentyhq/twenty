import { describe, expect, it } from 'vitest';

import { stripMarkdown } from './strip-markdown';

describe('stripMarkdown', () => {
  it('removes headings, emphasis, and list markers', () => {
    expect(
      stripMarkdown('**Senior partner**\n\n#### Who we work with\n\n- Seed to Series C'),
    ).toBe('Senior partner Who we work with Seed to Series C');
  });

  it('unwraps link labels', () => {
    expect(stripMarkdown('[Twenty](https://twenty.com)')).toBe('Twenty');
  });
});
