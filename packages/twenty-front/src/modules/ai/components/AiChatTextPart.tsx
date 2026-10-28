import { AiChatTextRevealEffect } from '@/ai/components/AiChatTextRevealEffect';
import { LazyMarkdownContent } from '@/ai/components/LazyMarkdownRenderer';
import { useSmoothlyRevealedText } from '@/ai/hooks/useSmoothlyRevealedText';
import { type MarkdownDisplayMode } from '@/ai/types/MarkdownDisplayMode';
import { getDisplayableStreamingMarkdown } from '@/ai/utils/getDisplayableStreamingMarkdown';

type AiChatTextPartProps = {
  text: string;
  isStreaming: boolean;
  displayMode: MarkdownDisplayMode;
};

export const AiChatTextPart = ({
  text,
  isStreaming,
  displayMode,
}: AiChatTextPartProps) => {
  const { revealedText, isRevealing, revealNextFrame } =
    useSmoothlyRevealedText({ text, isStreaming });

  return (
    <>
      {isRevealing && (
        <AiChatTextRevealEffect onAnimationFrame={revealNextFrame} />
      )}
      <LazyMarkdownContent
        text={
          isStreaming || isRevealing
            ? getDisplayableStreamingMarkdown(revealedText)
            : text
        }
        displayMode={displayMode}
      />
    </>
  );
};
