import { useLingui } from '@lingui/react/macro';
import { captureException } from '@sentry/react';
import { useCallback, useState } from 'react';
import { fetchComponentSource } from 'twenty-front-component-renderer';
import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type PageLayoutType } from 'twenty-shared/types';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { getFingerprintedRestUrl } from '@/front-components/utils/getFingerprintedRestUrl';

const SESSION_COOKIE_HEADERS = { [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1' };

type FrontComponentPreview = {
  pageLayoutType: PageLayoutType.DASHBOARD | PageLayoutType.RECORD_PAGE;
  isCurrent: boolean;
  publishedComponentId?: string;
  componentSource: string;
  applicationId: string;
  sharedDependenciesChecksum?: string | null;
  mockQueryResult: Record<string, unknown>;
};

type LoadedFrontComponentPreview = FrontComponentPreview & {
  sharedDependenciesSource: string;
};

export const useAiChatFrontComponentPreview = (draftId: string) => {
  const { t } = useLingui();
  const [preview, setPreview] = useState<LoadedFrontComponentPreview>();
  const [loadingError, setLoadingError] = useState<string>();
  const [runtimeError, setRuntimeError] = useState<string>();
  const endpoint = `${REST_API_BASE_URL}/ai-front-components/drafts/${encodeURIComponent(draftId)}`;
  const loadPreview = useCallback(
    async ({
      signal,
      shouldLoadDependencies,
    }: {
      signal: AbortSignal;
      shouldLoadDependencies: boolean;
    }) => {
      setLoadingError(undefined);

      try {
        const response = await fetch(endpoint, {
          credentials: 'include',
          headers: SESSION_COOKIE_HEADERS,
          signal,
        });

        if (!response.ok) {
          throw new CustomError(
            doNotTranslate(`Preview request failed: ${response.status}`),
            'AI_FRONT_COMPONENT_PREVIEW_LOAD_FAILED',
          );
        }
        const result: FrontComponentPreview = await response.json();

        if (signal.aborted) {
          return false;
        }

        setPreview((current) => {
          if (!isDefined(current)) {
            return current;
          }

          return {
            ...current,
            isCurrent: result.isCurrent,
            publishedComponentId: result.publishedComponentId,
          };
        });

        if (!shouldLoadDependencies) {
          return true;
        }

        const sharedDependenciesSource = await fetchComponentSource({
          url: getFingerprintedRestUrl({
            resource: 'front-component-shared-dependencies',
            id: result.applicationId,
            checksum: result.sharedDependenciesChecksum ?? undefined,
          }),
          credentials: 'include',
          headers: SESSION_COOKIE_HEADERS,
        });

        if (signal.aborted) {
          return false;
        }
        const loadedPreview = { ...result, sharedDependenciesSource };
        setPreview((current) => current ?? loadedPreview);
        return true;
      } catch (failure) {
        if (!signal.aborted) {
          captureException(failure);
          setLoadingError(t`Could not load preview.`);
        }
        return false;
      }
    },
    [endpoint, t],
  );

  const reportPreviewError = useCallback(
    async (failure?: Error) => {
      if (!isDefined(failure)) {
        return;
      }
      const message = (
        failure.message.trim() || t`Component failed to render.`
      ).slice(0, 2000);

      setRuntimeError(message);

      try {
        const response = await fetch(`${endpoint}/preview-error`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...SESSION_COOKIE_HEADERS,
          },
          body: JSON.stringify({ message }),
        });

        if (!response.ok) {
          throw new CustomError(
            doNotTranslate(`Preview error report failed: ${response.status}`),
            'AI_FRONT_COMPONENT_PREVIEW_REPORT_FAILED',
          );
        }
      } catch (reportingError) {
        captureException(reportingError);
      }
    },
    [endpoint, t],
  );

  return {
    preview,
    error: runtimeError ?? loadingError,
    loadPreview,
    reportPreviewError,
  };
};
