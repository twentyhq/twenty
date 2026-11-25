import { isNonEmptyString } from '@sniptt/guards';
import { WHATSAPP_DELETED_MESSAGE_NOTE_PREFIX } from 'src/constants/whatsapp-deleted-message-note-prefix.constant';

// Meta can deliver the same revoke more than once, so the note is only added once
export const buildRevokedMessageText = ({
  originalText,
  revokedAt,
}: {
  originalText: string | null;
  revokedAt: Date;
}): string => {
  if (isNonEmptyString(originalText) && originalText.includes(WHATSAPP_DELETED_MESSAGE_NOTE_PREFIX)) {
    return originalText;
  }

  return [originalText, `${WHATSAPP_DELETED_MESSAGE_NOTE_PREFIX}${revokedAt.toISOString()})`]
    .filter(isNonEmptyString)
    .join('\n\n');
};
