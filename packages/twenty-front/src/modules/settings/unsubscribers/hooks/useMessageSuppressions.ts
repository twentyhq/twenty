import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';

import { MESSAGE_SUPPRESSIONS_PAGE_SIZE } from '@/settings/unsubscribers/constants/MessageSuppressionsPageSize';
import {
  type MessageSuppressionReason,
  MessageSuppressionsDocument,
} from '~/generated-metadata/graphql';

type UseMessageSuppressionsParams = {
  page?: number;
  searchTerm?: string;
  reason?: MessageSuppressionReason;
  unsubscribeTopicId?: string;
  skip?: boolean;
};

export const useMessageSuppressions = ({
  page = 0,
  searchTerm,
  reason,
  unsubscribeTopicId,
  skip,
}: UseMessageSuppressionsParams) => {
  const { data, loading } = useQuery(MessageSuppressionsDocument, {
    variables: {
      input: {
        limit: MESSAGE_SUPPRESSIONS_PAGE_SIZE,
        offset: page * MESSAGE_SUPPRESSIONS_PAGE_SIZE,
        ...(isNonEmptyString(searchTerm) ? { searchTerm } : {}),
        ...(isNonEmptyString(unsubscribeTopicId) ? { unsubscribeTopicId } : {}),
        ...(reason ? { reason } : {}),
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
