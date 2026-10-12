import { describe, expect, it } from 'vitest';

import { createOutputCollector } from '@/app/create-output-collector';

describe('createOutputCollector', () => {
  it('keeps at most the limit and marks the rest as truncated', () => {
    const collector = createOutputCollector(8);

    for (let index = 0; index < 100; index += 1) {
      collector.add(Buffer.from('abcdef'));
    }

    expect(collector.read()).toEqual({ text: 'abcdefab', isTruncated: true });
  });

  it('copies bytes instead of keeping references to incoming chunks', () => {
    const collector = createOutputCollector(1024);
    const chunk = Buffer.from('original output');

    collector.add(chunk);
    chunk.fill('x');

    expect(collector.read()).toEqual({
      text: 'original output',
      isTruncated: false,
    });
  });
});
