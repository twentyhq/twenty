import { useQuery } from '@apollo/client/react';

import { GetInviteSuggestionsDocument } from '~/generated-metadata/graphql';

export const usePrefetchInviteSuggestions = () => {
  useQuery(GetInviteSuggestionsDocument, {
    fetchPolicy: 'cache-first',
  });
};
