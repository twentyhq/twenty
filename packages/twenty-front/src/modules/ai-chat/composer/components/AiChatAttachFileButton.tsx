import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { useRef } from 'react';
import { IconButton } from 'twenty-ui/components/input';
import { IconPaperclip } from 'twenty-ui/icon';

import { AiChatFileInput } from '@/ai-chat/composer/components/AiChatFileInput';

type AiChatAttachFileButtonProps = {
  editor: Editor | null;
};

export const AiChatAttachFileButton = ({
  editor,
}: AiChatAttachFileButtonProps) => {
  const { t } = useLingui();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <AiChatFileInput ref={fileInputRef} />
      <IconButton
        variant="ghost"
        size="sm"
        aria-label={t`Attach files`}
        onClick={() => {
          editor?.view.focus();
          fileInputRef.current?.click();
        }}
      >
        <IconPaperclip />
      </IconButton>
    </>
  );
};
