import { prepareBodyWithSignedUrls } from '@/blocknote-editor/utils/prepareBodyWithSignedUrls';

describe('prepareBodyWithSignedUrls', () => {
  it('should return empty string as-is', () => {
    expect(prepareBodyWithSignedUrls('')).toBe('');
  });

  it('should parse and re-stringify blocks', () => {
    const input = JSON.stringify([{ type: 'paragraph', content: 'text' }]);
    const result = JSON.parse(prepareBodyWithSignedUrls(input));
    expect(result).toEqual([{ type: 'paragraph', content: 'text' }]);
  });

  it('should pass through non-image blocks unchanged', () => {
    const blocks = [
      { type: 'paragraph', content: 'text' },
      { type: 'heading', content: 'title' },
      { type: 'bulletListItem', content: 'item' },
    ];
    const result = JSON.parse(
      prepareBodyWithSignedUrls(JSON.stringify(blocks)),
    );
    expect(result).toEqual(blocks);
  });

  it('should skip image blocks without props', () => {
    const input = JSON.stringify([{ type: 'image' }]);
    const result = JSON.parse(prepareBodyWithSignedUrls(input));
    expect(result).toEqual([{ type: 'image' }]);
  });

  it('should skip image blocks without url in props', () => {
    const input = JSON.stringify([{ type: 'image', props: { alt: 'test' } }]);
    const result = JSON.parse(prepareBodyWithSignedUrls(input));
    expect(result).toEqual([{ type: 'image', props: { alt: 'test' } }]);
  });

  it('should process image blocks with valid URLs', () => {
    const input = JSON.stringify([
      { type: 'image', props: { url: 'https://example.com/image.png' } },
    ]);
    const result = JSON.parse(prepareBodyWithSignedUrls(input));
    expect(result[0].type).toBe('image');
    expect(result[0].props.url).toContain('example.com');
  });

  it('keeps a malformed image URL and still normalizes other images', () => {
    const input = JSON.stringify([
      { type: 'image', props: { url: 'not-a-url' } },
      { type: 'image', props: { url: 'https://example.com:443/image.png' } },
    ]);

    expect(JSON.parse(prepareBodyWithSignedUrls(input))).toEqual([
      { type: 'image', props: { url: 'not-a-url' } },
      { type: 'image', props: { url: 'https://example.com/image.png' } },
    ]);
  });
});
