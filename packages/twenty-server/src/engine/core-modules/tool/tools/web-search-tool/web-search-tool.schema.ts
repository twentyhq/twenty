import { z } from 'zod';

import { WEB_SEARCH_CATEGORIES } from 'src/engine/core-modules/web-search/constants/web-search-categories.const';

export const WEB_SEARCH_DEFAULT_NUM_RESULTS = 10;
export const WEB_SEARCH_MAX_NUM_RESULTS = 30;

export const WebSearchInputZodSchema = z.object({
  query: z
    .string()
    .describe(
      'The search query to look up on the web. Be specific and include relevant keywords for better results.',
    ),
  category: z
    .enum(WEB_SEARCH_CATEGORIES)
    .optional()
    .describe(
      'Optional content category to focus the search. Use "company" for business/organization info, "people" for person profiles, "news" for recent articles, "research paper" for academic content.',
    ),
  numResults: z
    .number()
    .int()
    .min(1)
    .max(WEB_SEARCH_MAX_NUM_RESULTS)
    .optional()
    .describe(
      `Number of search results to return. Defaults to ${WEB_SEARCH_DEFAULT_NUM_RESULTS}, max ${WEB_SEARCH_MAX_NUM_RESULTS}. Use more results when you need comprehensive coverage.`,
    ),
});
