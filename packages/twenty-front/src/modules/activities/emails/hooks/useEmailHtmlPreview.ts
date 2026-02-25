import { useQuery } from '@apollo/client';

import { getMessageHtmlPreview } from '@/activities/emails/graphql/queries/getMessageHtmlPreview';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { isNonEmptyString } from '@sniptt/guards';

export const useEmailHtmlPreview = (messageId: string, skip: boolean) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error } = useQuery(getMessageHtmlPreview, {
    client: apolloCoreClient,
    variables: { messageId },
    skip: skip || !isNonEmptyString(messageId),
    fetchPolicy: 'cache-first',
  });

  return {
    html: data?.getMessageHtmlPreview?.html ?? null,
    isLoading: loading,
    error: error?.message ?? null,
  };
};
