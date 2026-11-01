import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { FrontComponentSourceRenderer } from 'twenty-front-component-renderer';
import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Badge } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useThemeColorScheme } from 'twenty-ui/theme';

import { AiChatFrontComponentPreviewEffect } from '@/ai/components/AiChatFrontComponentPreviewEffect';
import { useAiChatFrontComponentPreview } from '@/ai/hooks/useAiChatFrontComponentPreview';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
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
  height: calc(3 * ${themeCssVariables.spacing[30]});
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
  const { preview, error, loadPreview, reportPreviewError } =
    useAiChatFrontComponentPreview(draftId);
  const [isReady, setIsReady] = useState(false);
  const handleReady = useCallback(() => setIsReady(true), []);

  return (
    <StyledPreview>
      <AiChatFrontComponentPreviewEffect loadPreview={loadPreview} />
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
              onError={reportPreviewError}
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
