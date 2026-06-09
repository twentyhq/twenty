export const chunk = <TItem>(items: TItem[], size: number): TItem[][] => {
  if (size <= 0) {
    return items.length > 0 ? [items] : [];
  }

  const chunks: TItem[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};
