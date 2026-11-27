export type UnipilePage<TItem> = {
  items: TItem[];
  nextCursor: string | undefined;
  totalCount?: number;
};
