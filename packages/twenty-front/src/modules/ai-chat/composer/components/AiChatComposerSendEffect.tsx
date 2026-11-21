import { type Editor } from '@tiptap/react';

import { useAiChatComposerSend } from '@/ai-chat/composer/hooks/useAiChatComposerSend';

type AiChatComposerSendEffectProps = {
  editor: Editor | null;
  isComposerCentered: boolean;
};

export const AiChatComposerSendEffect = ({
  editor,
  isComposerCentered,
}: AiChatComposerSendEffectProps) => {
  useAiChatComposerSend({ editor, isComposerCentered });

  return null;
};
