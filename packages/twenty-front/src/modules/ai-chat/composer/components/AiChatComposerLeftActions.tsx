import { type Editor } from '@tiptap/react';

import { AiChatAddMenu } from '@/ai-chat/composer/components/AiChatAddMenu';
import { AiChatAttachFileButton } from '@/ai-chat/composer/components/AiChatAttachFileButton';
import { AiChatDictationButton } from '@/ai-chat/dictation/components/AiChatDictationButton';
import { AiChatContextUsageButton } from '@/ai-chat/usage/components/AiChatContextUsageButton';

type AiChatComposerLeftActionsProps = {
  editor: Editor | null;
  isDirectMessage: boolean;
};

export const AiChatComposerLeftActions = ({
  editor,
  isDirectMessage,
}: AiChatComposerLeftActionsProps) => {
  if (isDirectMessage) {
    return <AiChatAttachFileButton editor={editor} />;
  }

  return (
    <>
      <AiChatAddMenu editor={editor} />
      <AiChatDictationButton />
      <AiChatContextUsageButton />
    </>
  );
};
