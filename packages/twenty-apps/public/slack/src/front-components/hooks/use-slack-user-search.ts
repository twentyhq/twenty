import { SLACK_USER_LINKS_SEARCH_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { useSlackRouteSearch } from 'src/front-components/hooks/use-slack-route-search';
import {
  FALLBACK_SEARCH_ERROR_MESSAGE,
  parseSlackUserSearchResponse,
} from 'src/front-components/utils/parse-slack-user-search-response.util';

export const useSlackUserSearch = (searchTerm: string) =>
  useSlackRouteSearch({
    routePath: SLACK_USER_LINKS_SEARCH_ROUTE_PATH,
    searchTerm,
    parseResponse: parseSlackUserSearchResponse,
    fallbackErrorMessage: FALLBACK_SEARCH_ERROR_MESSAGE,
  });
