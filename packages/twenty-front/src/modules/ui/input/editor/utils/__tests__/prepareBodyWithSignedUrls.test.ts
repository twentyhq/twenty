import { prepareBodyWithSignedUrls } from '@/ui/input/editor/utils/prepareBodyWithSignedUrls';

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
});
