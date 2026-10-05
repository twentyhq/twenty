import { SLACK_CHANNEL_RULES_SEARCH_ROUTE_PATH } from 'src/constants/slack-channel-rules-route-path.constant';
import { useSlackRouteSearch } from 'src/front-components/hooks/use-slack-route-search';
import {
  FALLBACK_CHANNEL_SEARCH_ERROR_MESSAGE,
  parseSlackChannelSearchResponse,
} from 'src/front-components/utils/parse-slack-channel-search-response.util';

export const useSlackChannelSearch = (searchTerm: string) =>
  useSlackRouteSearch({
    routePath: SLACK_CHANNEL_RULES_SEARCH_ROUTE_PATH,
    searchTerm,
    parseResponse: parseSlackChannelSearchResponse,
    fallbackErrorMessage: FALLBACK_CHANNEL_SEARCH_ERROR_MESSAGE,
  });
