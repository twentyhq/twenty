import { useCallback, useRef } from 'react';

import { getMessageHtmlPreviewBatch } from '@/activities/emails/graphql/queries/getMessageHtmlPreviewBatch';
import { emailHtmlPreviewCacheState } from '@/activities/emails/states/emailHtmlPreviewCacheState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useStore } from 'jotai';

type MessageHtmlPreview = {
  messageId: string;
  html: string | null;
};

export const usePrefetchEmailHtml = () => {
  const apolloCoreClient = useApolloCoreClient();
  const store = useStore();
  const prefetchedThreadIdsRef = useRef(new Set<string>());

  const prefetchThreadsHtml = useCallback(
    async (messageThreadIds: string[]) => {
      const newThreadIds = messageThreadIds.filter(
        (id) => !prefetchedThreadIdsRef.current.has(id),
      );

      if (newThreadIds.length === 0) {
        return;
      }

      for (const id of newThreadIds) {
        prefetchedThreadIdsRef.current.add(id);
      }

      try {
        const { data } = await apolloCoreClient.query({
          query: getMessageHtmlPreviewBatch,
          variables: { messageThreadIds: newThreadIds },
          fetchPolicy: 'no-cache',
        });

        const previews: MessageHtmlPreview[] =
          data?.getMessageHtmlPreviewBatch?.previews ?? [];

        for (const preview of previews) {
          if (preview.html) {
            store.set(
              emailHtmlPreviewCacheState.atomFamily(preview.messageId),
              preview.html,
            );
          }
        }
      } catch {
        // Prefetch failures are non-critical — user can still fetch on demand
      }
    },
    [apolloCoreClient, store],
  );

  return { prefetchThreadsHtml };
};
