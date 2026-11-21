export const chunkArray = <TItem>(items: TItem[], size: number): TItem[][] => {
  const chunks: TItem[][] = [];

  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }

  return chunks;
};
