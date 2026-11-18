import { type MarkdownBlockSplitCache } from '@/ai-chat/message-content/types/MarkdownBlockSplitCache';

export const EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE: MarkdownBlockSplitCache = {
  text: '',
  blocks: [],
  stablePrefix: '',
  stableBlocks: [],
};
