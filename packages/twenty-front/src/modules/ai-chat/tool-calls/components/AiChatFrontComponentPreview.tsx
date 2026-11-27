import { AiChatFrontComponentPreviewContent } from '@/ai-chat/tool-calls/components/AiChatFrontComponentPreviewContent';
import { useAiChatFrontComponentPreview } from '@/ai-chat/tool-calls/hooks/useAiChatFrontComponentPreview';

type AiChatFrontComponentPreviewProps = {
  draftId: string;
};

export const AiChatFrontComponentPreview = ({
  draftId,
}: AiChatFrontComponentPreviewProps) => {
  return <AiChatFrontComponentPreviewLoader key={draftId} draftId={draftId} />;
};

type AiChatFrontComponentPreviewLoaderProps = AiChatFrontComponentPreviewProps;

const AiChatFrontComponentPreviewLoader = ({
  draftId,
}: AiChatFrontComponentPreviewLoaderProps) => {
  const {
    preview,
    error,
    isRendered,
    loadPreview,
    reportPreviewError,
    reportPreviewRendered,
  } = useAiChatFrontComponentPreview(draftId);

  return (
    <AiChatFrontComponentPreviewContent
      draftId={draftId}
      preview={preview}
      error={error}
      isRendered={isRendered}
      loadPreview={loadPreview}
      reportPreviewError={reportPreviewError}
      reportPreviewRendered={reportPreviewRendered}
    />
  );
};
