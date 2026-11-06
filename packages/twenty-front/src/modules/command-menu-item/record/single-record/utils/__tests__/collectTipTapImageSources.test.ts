import { collectTipTapImageSources } from '@/command-menu-item/record/single-record/utils/collectTipTapImageSources';

describe('collectTipTapImageSources', () => {
  it('should collect image sources at any depth', () => {
    expect(
      collectTipTapImageSources({
        type: 'doc',
        content: [
          { type: 'image', attrs: { src: 'https://example.com/a.png' } },
          {
            type: 'blockquote',
            content: [
              { type: 'image', attrs: { src: 'https://example.com/b.png' } },
              { type: 'image', attrs: { src: '' } },
            ],
          },
        ],
      }),
    ).toEqual(['https://example.com/a.png', 'https://example.com/b.png']);
  });
});
