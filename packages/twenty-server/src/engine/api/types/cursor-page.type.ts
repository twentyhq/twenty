import { type CursorPageFlags } from 'src/engine/api/types/cursor-page-flags.type';

export type CursorPage<TItem> = {
  items: TItem[];
  pageInfo: CursorPageFlags;
};
