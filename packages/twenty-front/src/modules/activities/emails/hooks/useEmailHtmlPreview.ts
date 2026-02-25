import { useCallback, useState } from 'react';

import { getMessageHtmlPreview } from '@/activities/emails/graphql/queries/getMessageHtmlPreview';
import { emailHtmlPreviewCacheState } from '@/activities/emails/states/emailHtmlPreviewCacheState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useEmailHtmlPreview = (messageId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cachedHtml = useAtomFamilyStateValue(
    emailHtmlPreviewCacheState,
    messageId,
  );
  const setCachedHtml = useSetAtomFamilyState(
    emailHtmlPreviewCacheState,
    messageId,
  );

  const apolloCoreClient = useApolloCoreClient();

  const fetchHtmlPreview = useCallback(async () => {
    if (cachedHtml) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await apolloCoreClient.query({
        query: getMessageHtmlPreview,
        variables: { messageId },
        fetchPolicy: 'no-cache',
      });

      const html = data?.getMessageHtmlPreview?.html ?? null;

      setCachedHtml(html);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load HTML preview',
      );
    } finally {
      setIsLoading(false);
    }
  }, [messageId, cachedHtml, apolloCoreClient, setCachedHtml]);

  const clearPreview = useCallback(() => {
    setCachedHtml(null);
    setError(null);
  }, [setCachedHtml]);

  return {
    html: cachedHtml,
    isLoading,
    error,
    fetchHtmlPreview,
    clearPreview,
  };
};
