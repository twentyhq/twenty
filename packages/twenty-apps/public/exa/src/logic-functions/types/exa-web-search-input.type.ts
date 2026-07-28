import { type EXA_CATEGORIES } from '../constants/exa-categories.constant';

export type ExaWebSearchInput = {
  query: string;
  category?: (typeof EXA_CATEGORIES)[number];
  numResults?: number;
};
