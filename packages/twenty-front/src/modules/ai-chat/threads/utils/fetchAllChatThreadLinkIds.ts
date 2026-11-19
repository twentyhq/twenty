import { type ApolloClient } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';
import { type DocumentNode } from 'graphql';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';

export const fetchAllChatThreadLinkIds = async ({
  apolloCoreClient,
  query,
  filter,
  objectNamePlural,
}: {
  apolloCoreClient: ApolloClient;
  query: DocumentNode;
  filter: RecordGqlOperationFilter;
  objectNamePlural: string;
}): Promise<string[]> => {
  const linkIds: string[] = [];
  let lastCursor: string | undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data, error } =
      await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
        query,
        variables: {
          filter,
          limit: DEFAULT_QUERY_PAGE_SIZE,
          lastCursor,
        },
        fetchPolicy: 'network-only',
      });

    if (isDefined(error)) {
      throw error;
    }

    const connection = data?.[objectNamePlural];

    for (const { node } of connection?.edges ?? []) {
      linkIds.push(node.id);
    }

    hasNextPage = connection?.pageInfo?.hasNextPage === true;

    const nextCursor = connection?.pageInfo?.endCursor;
    const canAdvanceCursor =
      isNonEmptyString(nextCursor) && nextCursor !== lastCursor;

    if (hasNextPage && !canAdvanceCursor) {
      throw new Error(
        doNotTranslate('Unable to load the next page of conversation links.'),
      );
    }

    lastCursor = nextCursor ?? undefined;
  }

  return linkIds;
};
