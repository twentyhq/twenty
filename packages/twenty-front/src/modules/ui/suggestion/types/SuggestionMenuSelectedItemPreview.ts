import { type ReactNode } from 'react';

export type SuggestionMenuSelectedItemPreview<TItem> = {
  render: (item: TItem) => ReactNode;
  width: number;
};
