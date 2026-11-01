import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useState } from 'react';
import { fetchComponentSource } from 'twenty-front-component-renderer';
import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';
import { type PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { getFingerprintedRestUrl } from '@/front-components/utils/getFingerprintedRestUrl';

type FrontComponentPreview = {
  pageLayoutType: PageLayoutType.DASHBOARD | PageLayoutType.RECORD_PAGE;
  isCurrent: boolean;
  publishedComponentId?: string;
  componentSource: string;
  applicationId: string;
  sharedDependenciesChecksum?: string | null;
  mockQueryResult: Record<string, unknown>;
};

export const useAiChatFrontComponentPreview = (draftId: string) => {
  const { t } = useLingui();
  const [preview, setPreview] = useState<
    FrontComponentPreview & { sharedDependenciesSource: string }
  >();
  const [error, setError] = useState<string>();
  const [refreshCount, setRefreshCount] = useState(0);
  const endpoint = `${REST_API_BASE_URL}/ai-front-components/drafts/${encodeURIComponent(draftId)}`;
  const hasPreview = isDefined(preview);
  const requestRefresh = useCallback(
    () => setRefreshCount((count) => count + 1),
    [],
  );

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME,
    onBrowserEvent: requestRefresh,
  });

  const fetchPreview = useCallback(
    async (signal: AbortSignal): Promise<FrontComponentPreview> => {
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: { [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1' },
        signal,
      });

      if (!response.ok) {
        throw new Error(
          t`Preview unavailable. It may have expired or you may no longer have access.`,
        );
      }

      return response.json();
    },
    [endpoint, t],
  );
  const handleLoadError = useCallback(
    (failure: unknown) =>
      setError(
        failure instanceof Error ? failure.message : t`Could not load preview.`,
      ),
    [t],
  );

  useEffect(() => {
    const abortController = new AbortController();
    const loadPreview = async () => {
      const result = await fetchPreview(abortController.signal);
      const sharedDependenciesSource = await fetchComponentSource({
        url: getFingerprintedRestUrl({
          resource: 'front-component-shared-dependencies',
          id: result.applicationId,
          checksum: result.sharedDependenciesChecksum ?? undefined,
        }),
        credentials: 'include',
        headers: { [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1' },
      });

      if (!abortController.signal.aborted) {
        setPreview({ ...result, sharedDependenciesSource });
      }
    };

    void loadPreview().catch((failure: unknown) => {
      if (!abortController.signal.aborted) {
        handleLoadError(failure);
      }
    });

    return () => abortController.abort();
  }, [fetchPreview, handleLoadError]);

  useEffect(() => {
    if (!hasPreview || refreshCount === 0) {
      return;
    }

    const abortController = new AbortController();

    void fetchPreview(abortController.signal)
      .then((result) => {
        if (!abortController.signal.aborted) {
          setPreview((current) =>
            isDefined(current)
              ? {
                  ...current,
                  isCurrent: result.isCurrent,
                  publishedComponentId: result.publishedComponentId,
                }
              : current,
          );
          setError(undefined);
        }
      })
      .catch((failure: unknown) => {
        if (!abortController.signal.aborted) {
          handleLoadError(failure);
        }
      });

    return () => abortController.abort();
  }, [fetchPreview, handleLoadError, hasPreview, refreshCount]);

  return { preview, error };
};
