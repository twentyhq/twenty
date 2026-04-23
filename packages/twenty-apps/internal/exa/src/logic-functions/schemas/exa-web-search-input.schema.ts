import { type InputJsonSchema } from 'twenty-shared/logic-function';

import { DEFAULT_NUM_RESULTS } from '../constants/default-num-results.constant';
import { EXA_CATEGORIES } from '../constants/exa-categories.constant';

const MAX_NUM_RESULTS = 30;

export const exaWebSearchInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description:
        'The search query to look up on the web. Be specific and include relevant keywords for better results.',
    },
    category: {
      type: 'string',
      enum: [...EXA_CATEGORIES],
      description:
        'Optional content category to focus the search. Use "company" for business/organization info, "people" for person profiles, "news" for recent articles, "research paper" for academic content.',
    },
    numResults: {
      type: 'integer',
      minimum: 1,
      maximum: MAX_NUM_RESULTS,
      description: `Number of search results to return. Defaults to ${DEFAULT_NUM_RESULTS}, max ${MAX_NUM_RESULTS}. Use more results when you need comprehensive coverage.`,
    },
  },
  required: ['query'],
  additionalProperties: false,
};
