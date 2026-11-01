import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { FrontComponentSourceRenderer } from 'twenty-front-component-renderer';
import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';
import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Badge } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useThemeColorScheme } from 'twenty-ui/theme';

import { useAiChatFrontComponentPreview } from '@/ai/hooks/useAiChatFrontComponentPreview';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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

type AiChatFrontComponentPreviewProps = {
  draftId: string;
};

export const AiChatFrontComponentPreview = ({
  draftId,
}: AiChatFrontComponentPreviewProps) => {
  const isEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_COMPONENT_BUILDER_ENABLED,
  );

  return isEnabled ? (
    <AiChatFrontComponentPreviewContent key={draftId} draftId={draftId} />
  ) : null;
};

type AiChatFrontComponentPreviewContentProps = AiChatFrontComponentPreviewProps;

const AiChatFrontComponentPreviewContent = ({
  draftId,
}: AiChatFrontComponentPreviewContentProps) => {
  const { t } = useLingui();
  const colorScheme = useThemeColorScheme();
  const { preview, error: loadingError } =
    useAiChatFrontComponentPreview(draftId);
  const [runtimeError, setRuntimeError] = useState<string>();
  const error = runtimeError ?? loadingError;
  const [isReady, setIsReady] = useState(false);
  const endpoint = `${REST_API_BASE_URL}/ai-front-components/drafts/${encodeURIComponent(draftId)}`;
  const handleReady = useCallback(() => setIsReady(true), []);
  const handleError = useCallback(
    (failure?: Error) => {
      if (!isDefined(failure)) {
        return;
      }
      const message = failure.message.slice(0, 2000);

      setRuntimeError(message);
      void fetch(`${endpoint}/preview-error`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1',
        },
        body: JSON.stringify({ message }),
      }).catch(() => undefined);
    },
    [endpoint],
  );

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
          {isDefined(preview.publishedComponentId) && (
            <span>{t`Saved to Workspace app`}</span>
          )}
          <StyledContent
            role="region"
            aria-label={t`Component preview with sample data`}
          >
            <FrontComponentSourceRenderer
              componentId={draftId}
              componentSource={preview.componentSource}
              sharedDependenciesSource={preview.sharedDependenciesSource}
              mockQueryResult={preview.mockQueryResult}
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
