import { describe, expect, it } from 'vitest';

import { splitOutgoingText } from 'src/logic-functions/data/split-outgoing-text.util';

describe('splitOutgoingText', () => {
  it('keeps a short text whole', () => {
    expect(splitOutgoingText('Hello there')).toEqual(['Hello there']);
  });

  it('splits on the last line break that fits', () => {
    expect(splitOutgoingText('first line\nsecond line', 15)).toEqual([
      'first line',
      'second line',
    ]);
  });

  it('splits on a space when no line break fits', () => {
    expect(splitOutgoingText('one two three', 8)).toEqual(['one two', 'three']);
  });

  it('cuts a word longer than the limit', () => {
    expect(splitOutgoingText('abcdefghij', 4)).toEqual(['abcd', 'efgh', 'ij']);
  });

  it('never splits a character made of two UTF-16 code units', () => {
    const chunks = splitOutgoingText('ab😀cd', 3);

    expect(chunks).toEqual(['ab', '😀c', 'd']);
    expect(chunks.join('')).toBe('ab😀cd');
  });

  it('keeps every chunk within the limit', () => {
    const chunks = splitOutgoingText('word '.repeat(3000));

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 5000)).toBe(true);
  });
});
