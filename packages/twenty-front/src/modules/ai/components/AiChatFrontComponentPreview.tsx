import { AiChatFrontComponentPreviewContent } from '@/ai/components/AiChatFrontComponentPreviewContent';
import { useAiChatFrontComponentPreview } from '@/ai/hooks/useAiChatFrontComponentPreview';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
    <AiChatFrontComponentPreviewLoader key={draftId} draftId={draftId} />
  ) : null;
};

type AiChatFrontComponentPreviewLoaderProps = AiChatFrontComponentPreviewProps;

const AiChatFrontComponentPreviewLoader = ({
  draftId,
}: AiChatFrontComponentPreviewLoaderProps) => {
  const { preview, error, loadPreview, reportPreviewError } =
    useAiChatFrontComponentPreview(draftId);

  return (
    <AiChatFrontComponentPreviewContent
      draftId={draftId}
      preview={preview}
      error={error}
      loadPreview={loadPreview}
      reportPreviewError={reportPreviewError}
    />
  );
};
