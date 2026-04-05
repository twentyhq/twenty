import { type WebSearchCategory } from 'src/engine/core-modules/web-search/types/web-search-category.type';

export type WebSearchOptions = {
  category?: WebSearchCategory;
  numResults?: number;
};
