import { useQuery } from '@apollo/client/react';

import { MESSAGE_SUPPRESSIONS_PAGE_SIZE } from '@/settings/unsubscribers/constants/MessageSuppressionsPageSize';
import { MessageSuppressionsDocument } from '~/generated-metadata/graphql';

type UseMessageSuppressionsParams = {
  page: number;
  skip?: boolean;
};

export const useMessageSuppressions = ({
  page,
  skip,
}: UseMessageSuppressionsParams) => {
  const { data, loading } = useQuery(MessageSuppressionsDocument, {
    variables: {
      input: {
        limit: MESSAGE_SUPPRESSIONS_PAGE_SIZE,
        offset: page * MESSAGE_SUPPRESSIONS_PAGE_SIZE,
      },
    },
    skip,
  });

  return {
    messageSuppressions: data?.messageSuppressions.records ?? [],
    totalCount: data?.messageSuppressions.totalCount ?? 0,
    loading,
  };
};
