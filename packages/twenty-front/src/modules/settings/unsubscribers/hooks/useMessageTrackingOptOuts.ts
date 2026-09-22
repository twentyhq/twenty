import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';

import { MESSAGE_SUPPRESSIONS_PAGE_SIZE } from '@/settings/unsubscribers/constants/MessageSuppressionsPageSize';
import { MessageTrackingOptOutsDocument } from '~/generated-metadata/graphql';

export const useMessageTrackingOptOuts = ({
  page,
  searchTerm,
}: {
  page: number;
  searchTerm: string;
}) => {
  const { data, loading } = useQuery(MessageTrackingOptOutsDocument, {
    variables: {
      input: {
        limit: MESSAGE_SUPPRESSIONS_PAGE_SIZE,
        offset: page * MESSAGE_SUPPRESSIONS_PAGE_SIZE,
        ...(isNonEmptyString(searchTerm) ? { searchTerm } : {}),
      },
    },
  });

  return {
    records: data?.messageTrackingOptOuts.records ?? [],
    totalCount: data?.messageTrackingOptOuts.totalCount ?? 0,
    loading,
  };
};
