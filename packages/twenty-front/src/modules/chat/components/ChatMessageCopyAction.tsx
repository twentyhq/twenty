import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconCopy } from 'twenty-ui/icon';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type ChatMessageCopyActionProps = {
  text: string;
};

export const ChatMessageCopyAction = ({ text }: ChatMessageCopyActionProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  return (
    <LightIconButton
      aria-label={t`Copy to Clipboard`}
      onClick={() => copyToClipboard(text, t`Text copied to clipboard`)}
    >
      <IconCopy />
    </LightIconButton>
  );
};
