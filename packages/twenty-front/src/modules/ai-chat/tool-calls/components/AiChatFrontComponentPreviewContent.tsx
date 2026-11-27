import { useMemo, useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { FrontComponentSourceRenderer } from 'twenty-front-component-renderer';
import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Badge } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useThemeColorScheme } from 'twenty-ui/theme';

import { useFrontComponentApplicationTokenPair } from '@/front-components/hooks/useFrontComponentApplicationTokenPair';
import { createQueryFrontComponentPreviewMetadata } from '@/ai-chat/tool-calls/utils/queryFrontComponentPreviewMetadata';
import { AiChatFrontComponentPreviewEffect } from '@/ai-chat/tool-calls/components/AiChatFrontComponentPreviewEffect';
import { type useAiChatFrontComponentPreview } from '@/ai-chat/tool-calls/hooks/useAiChatFrontComponentPreview';
import { useGetFrontComponentObjectMetadata } from '@/front-components/hooks/useGetFrontComponentObjectMetadata';

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
  height: calc(3 * ${themeCssVariables.spacing[30]});
  width: 100%;
`;

type AiChatFrontComponentPreviewContentProps = {
  draftId: string;
} & Pick<
  ReturnType<typeof useAiChatFrontComponentPreview>,
  | 'preview'
  | 'error'
  | 'isRendered'
  | 'loadPreview'
  | 'reportPreviewError'
  | 'reportPreviewRendered'
>;

export const AiChatFrontComponentPreviewContent = ({
  draftId,
  preview,
  error,
  isRendered,
  loadPreview,
  reportPreviewError,
  reportPreviewRendered,
}: AiChatFrontComponentPreviewContentProps) => {
  const { t } = useLingui();
  const colorScheme = useThemeColorScheme();
  const { loadFrontComponentApplicationTokenPair } =
    useFrontComponentApplicationTokenPair();
  const applicationId = preview?.applicationId;
  const getObjectMetadata = useGetFrontComponentObjectMetadata(applicationId);
  const queryMetadata = useMemo(
    () =>
      isDefined(applicationId)
        ? createQueryFrontComponentPreviewMetadata(async () => {
            const { applicationAccessToken } =
              await loadFrontComponentApplicationTokenPair(applicationId);
            return applicationAccessToken.token;
          })
        : undefined,
    [applicationId, loadFrontComponentApplicationTokenPair],
  );
  const [retryCount, setRetryCount] = useState(0);

  return (
    <StyledPreview>
      <AiChatFrontComponentPreviewEffect
        key={retryCount}
        loadPreview={loadPreview}
      />
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
              queryMetadata={queryMetadata}
              getObjectMetadata={getObjectMetadata}
              selectedRecordIds={preview.selectedRecordIds}
              selectedObjectMetadata={preview.selectedObjectMetadata}
              colorScheme={colorScheme}
              onReady={reportPreviewRendered}
              onError={reportPreviewError}
            />
          </StyledContent>
        </>
      )}
      {!isRendered && !isDefined(error) && (
        <span role="status">
          {isDefined(preview) ? t`Rendering preview…` : t`Loading preview…`}
        </span>
      )}
      {isDefined(error) && <span role="alert">{error}</span>}
      {isDefined(error) && !isDefined(preview) && (
        <Button size="sm" onClick={() => setRetryCount((count) => count + 1)}>
          {t`Retry`}
        </Button>
      )}
    </StyledPreview>
  );
};
