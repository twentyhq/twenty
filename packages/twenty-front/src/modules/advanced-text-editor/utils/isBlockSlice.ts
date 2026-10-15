import { type Slice } from '@tiptap/pm/model';

export const isBlockSlice = (slice: Slice) =>
  slice.openStart === 0 &&
  slice.openEnd === 0 &&
  (slice.content.firstChild?.isBlock ?? false);
