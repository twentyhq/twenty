import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useCallback, useEffect, useState } from 'react';
import { FrontComponentSourceRenderer } from 'twenty-front-component-renderer';
import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Badge } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useThemeColorScheme } from 'twenty-ui/theme';

import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const StyledPreview = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledContent = styled.div`
  height: 360px;
  width: 100%;
`;

type FrontComponentPreview = {
  draftId: string;
  pageLayoutType: PageLayoutType.DASHBOARD | PageLayoutType.RECORD_PAGE;
  isCurrent: boolean;
  published: boolean;
  componentSource: string;
  sharedDependenciesSource?: string;
  data: Record<string, unknown>;
};

type AiChatFrontComponentPreviewProps = {
  draftId: string;
  onReadyChange?: (isReady: boolean) => void;
};

export const AiChatFrontComponentPreview = ({
  draftId,
  onReadyChange,
}: AiChatFrontComponentPreviewProps) => {
  const { t } = useLingui();
  const colorScheme = useThemeColorScheme();
  const isEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_COMPONENT_BUILDER_ENABLED,
  );
  const [preview, setPreview] = useState<FrontComponentPreview>();
  const [error, setError] = useState<string>();
  const [isReady, setIsReady] = useState(false);
  const [reportDiagnostic, setReportDiagnostic] = useState<
    (status: 'ready' | 'error', message?: string) => void
  >(() => () => {});
  const handleReady = useCallback(
    () => reportDiagnostic('ready'),
    [reportDiagnostic],
  );
  const handleError = useCallback(
    (failure?: Error) => {
      if (isDefined(failure)) {
        reportDiagnostic('error', failure.message.slice(0, 2000));
      }
    },
    [reportDiagnostic],
  );

  useEffect(() => {
    onReadyChange?.(false);
    setPreview(undefined);
    setError(undefined);
    setIsReady(false);
    if (!isEnabled) {
      return;
    }
    const abortController = new AbortController();
    const endpoint = `${REACT_APP_SERVER_BASE_URL}/rest/ai-front-components/drafts/${encodeURIComponent(draftId)}`;
    let isCancelled = false;
    let hasRuntimeError = false;
    let loadedPreview: FrontComponentPreview | undefined;
    let diagnosticQueue = Promise.resolve();

    setReportDiagnostic(() => (status: 'ready' | 'error', message?: string) => {
      if (isCancelled || (status === 'ready' && hasRuntimeError)) {
        return;
      }
      if (status === 'error') {
        hasRuntimeError = true;
        setError(message);
        setIsReady(false);
        onReadyChange?.(false);
      }
      diagnosticQueue = diagnosticQueue
        .then(async () => {
          const response = await fetch(`${endpoint}/diagnostic`, {
            method: 'POST',
            credentials: 'include',
            signal: abortController.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, message }),
          });
          if (!response.ok) {
            throw new Error(
              t`Could not confirm the preview. Reopen it to retry.`,
            );
          }
          if (!isCancelled) {
            setIsReady(status === 'ready' && !hasRuntimeError);
            onReadyChange?.(
              status === 'ready' &&
                !hasRuntimeError &&
                loadedPreview?.isCurrent === true &&
                !loadedPreview.published,
            );
          }
        })
        .catch((failure: unknown) => {
          if (!isCancelled) {
            setError(
              failure instanceof Error
                ? failure.message
                : t`Could not confirm the preview.`,
            );
            onReadyChange?.(false);
          }
        });
    });

    void fetch(endpoint, {
      credentials: 'include',
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            t`Preview unavailable. It may have expired or you may no longer have access.`,
          );
        }
        return response.json() as Promise<FrontComponentPreview>;
      })
      .then((result) => {
        if (!isCancelled) {
          loadedPreview = result;
          setPreview(result);
        }
      })
      .catch((failure: unknown) => {
        if (!isCancelled) {
          setError(
            failure instanceof Error
              ? failure.message
              : t`Could not load preview.`,
          );
        }
      });

    return () => {
      isCancelled = true;
      abortController.abort();
      onReadyChange?.(false);
    };
  }, [draftId, isEnabled, onReadyChange, t]);

  if (!isEnabled) {
    return null;
  }

  return (
    <StyledPreview>
      <div>
        <Badge>{t`Sample data`}</Badge>
        {isDefined(preview) && (
          <Badge>
            {preview.pageLayoutType === PageLayoutType.DASHBOARD
              ? t`Dashboard widget`
              : t`Record page widget`}
          </Badge>
        )}
      </div>
      {isDefined(preview) && (
        <>
          {!preview.isCurrent && (
            <span>{t`A newer revision exists. Open the latest preview to save.`}</span>
          )}
          {preview.published && <span>{t`Saved to Workspace app`}</span>}
          <StyledContent aria-label={t`Component preview with sample data`}>
            <FrontComponentSourceRenderer
              key={draftId}
              componentId={draftId}
              componentSource={preview.componentSource}
              sharedDependenciesSource={preview.sharedDependenciesSource}
              data={preview.data}
              colorScheme={colorScheme}
              onReady={handleReady}
              onError={handleError}
            />
          </StyledContent>
        </>
      )}
      {!isReady && !isDefined(error) && (
        <span role="status">
          {isDefined(preview) ? t`Rendering preview…` : t`Loading preview…`}
        </span>
      )}
      {isDefined(error) && <span role="alert">{error}</span>}
    </StyledPreview>
  );
};
