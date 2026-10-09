import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';

// The server re-signs image URLs with a fresh token on every read.
export const stripImageUrlTokens = (stringifiedBody: string): string => {
  const blocks = parseInitialBlocknote(stringifiedBody);

  if (!blocks) return stringifiedBody;

  const blocksWithoutTokens = blocks.map((block) => {
    if (block.type !== 'image' || !block.props?.url) {
      return block;
    }

    try {
      const imageUrl = new URL(block.props.url);

      imageUrl.searchParams.delete('token');

      return {
        ...block,
        props: { ...block.props, url: imageUrl.toString() },
      };
    } catch {
      return block;
    }
  });

  return JSON.stringify(blocksWithoutTokens);
};
