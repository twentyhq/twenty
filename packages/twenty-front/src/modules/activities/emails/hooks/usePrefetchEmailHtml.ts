import { useCallback, useState } from 'react';

import { getMessageHtmlPreviewBatch } from '@/activities/emails/graphql/queries/getMessageHtmlPreviewBatch';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { getMessageHtmlPreview } from '@/activities/emails/graphql/queries/getMessageHtmlPreview';

type MessageHtmlPreview = {
  messageId: string;
  html: string | null;
};

export const usePrefetchEmailHtml = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [prefetchedThreadIds, setPrefetchedThreadIds] = useState(
    () => new Set<string>(),
  );

  const prefetchThreadsHtml = useCallback(
    async (messageThreadIds: string[]) => {
      const newThreadIds = messageThreadIds.filter(
        (id) => !prefetchedThreadIds.has(id),
      );

      if (newThreadIds.length === 0) {
        return;
      }

      setPrefetchedThreadIds((prev) => {
        const next = new Set(prev);

        for (const id of newThreadIds) {
          next.add(id);
        }

        return next;
      });

      try {
        const { data } = await apolloCoreClient.query({
          query: getMessageHtmlPreviewBatch,
          variables: { messageThreadIds: newThreadIds },
          fetchPolicy: 'no-cache',
        });

        const previews: MessageHtmlPreview[] =
          data?.getMessageHtmlPreviewBatch?.previews ?? [];

        // Write each preview into Apollo's cache as individual query results
        // so useQuery(getMessageHtmlPreview) picks them up via cache-first
        for (const preview of previews) {
          apolloCoreClient.writeQuery({
            query: getMessageHtmlPreview,
            variables: { messageId: preview.messageId },
            data: {
              getMessageHtmlPreview: {
                __typename: 'MessageHtmlPreview',
                messageId: preview.messageId,
                html: preview.html,
              },
            },
          });
        }
      } catch {
        // Prefetch failures are non-critical — user can still fetch on demand
      }
    },
    [apolloCoreClient, prefetchedThreadIds],
  );

  return { prefetchThreadsHtml };
};
