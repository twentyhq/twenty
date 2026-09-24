import {
  type FilterableBlock,
  filterBlocksSupportedBySchema,
} from '@/blocknote-editor/utils/filterBlocksSupportedBySchema';

const blockSchema = {
  paragraph: {},
  bulletListItem: {},
};

describe('filterBlocksSupportedBySchema', () => {
  it('should return undefined when there is nothing to filter', () => {
    expect(
      filterBlocksSupportedBySchema(undefined, blockSchema),
    ).toBeUndefined();
  });

  it('should keep blocks the schema knows', () => {
    const blocks = [{ type: 'paragraph', content: [] }];

    expect(filterBlocksSupportedBySchema(blocks, blockSchema)).toEqual([
      { type: 'paragraph', content: [], children: undefined },
    ]);
  });

  it('should drop blocks the schema does not know', () => {
    const blocks = [
      { type: 'image', props: { url: 'https://example.com/a.png' } },
      { type: 'paragraph', content: [] },
    ];

    const filtered = filterBlocksSupportedBySchema(blocks, blockSchema);

    expect(filtered).toHaveLength(1);
    expect(filtered?.[0].type).toBe('paragraph');
  });

  it('should drop a block with no type', () => {
    const blocks: FilterableBlock[] = [{}];

    expect(filterBlocksSupportedBySchema(blocks, blockSchema)).toEqual([]);
  });

  it('should drop unsupported children while keeping their parent', () => {
    const blocks = [
      {
        type: 'bulletListItem',
        children: [{ type: 'image' }, { type: 'paragraph' }],
      },
    ];

    const filtered = filterBlocksSupportedBySchema(blocks, blockSchema);

    expect(filtered?.[0].children).toEqual([
      { type: 'paragraph', children: undefined },
    ]);
  });

  it('should drop a whole subtree when its root is unsupported', () => {
    const blocks = [{ type: 'image', children: [{ type: 'paragraph' }] }];

    expect(filterBlocksSupportedBySchema(blocks, blockSchema)).toEqual([]);
  });

  it('should drop every block of a stored TipTap document', () => {
    const blocks = [{ type: 'bulletList', content: [{ type: 'listItem' }] }];

    expect(filterBlocksSupportedBySchema(blocks, blockSchema)).toEqual([]);
  });
});
