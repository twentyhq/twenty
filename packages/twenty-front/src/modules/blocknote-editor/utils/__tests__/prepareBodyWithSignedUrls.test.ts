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

  it('should leave relative image URLs unchanged without throwing', () => {
    const input = JSON.stringify([
      { type: 'image', props: { url: '/files/workspace/image.png' } },
      { type: 'paragraph', content: 'still saved' },
    ]);

    expect(() => prepareBodyWithSignedUrls(input)).not.toThrow();

    const result = JSON.parse(prepareBodyWithSignedUrls(input));
    expect(result[0].props.url).toBe('/files/workspace/image.png');
    expect(result[1].content).toBe('still saved');
  });

  it('should leave invalid image URLs unchanged without throwing', () => {
    const input = JSON.stringify([
      { type: 'image', props: { url: 'not a url' } },
    ]);

    expect(() => prepareBodyWithSignedUrls(input)).not.toThrow();

    const result = JSON.parse(prepareBodyWithSignedUrls(input));
    expect(result[0].props.url).toBe('not a url');
  });
});
