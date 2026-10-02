import {
  convertBlocknoteToMarkdownInWorker,
  convertMarkdownToBlocknoteInWorker,
  destroyRichTextConversionWorkerPool,
} from 'src/engine/core-modules/record-transformer/utils/rich-text-conversion-worker-pool.util';

describe('rich text conversion worker pool', () => {
  afterAll(async () => {
    await destroyRichTextConversionWorkerPool();
  });

  it('should convert markdown to blocknote and back in a worker thread', async () => {
    const blocknote = await convertMarkdownToBlocknoteInWorker(
      '# Title\n\nSome **bold** text',
    );

    expect(JSON.parse(blocknote)).toEqual([
      expect.objectContaining({ type: 'heading' }),
      expect.objectContaining({ type: 'paragraph' }),
    ]);

    const markdown = await convertBlocknoteToMarkdownInWorker(blocknote);

    expect(markdown).toBe('# Title\n\nSome **bold** text\n');
  });

  it('should reject when the blocknote value is not valid JSON', async () => {
    await expect(
      convertBlocknoteToMarkdownInWorker('not json'),
    ).rejects.toThrow();
  });
});
