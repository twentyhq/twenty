import { t } from '@lingui/core/macro';

export const getInboxNotificationTitle = ({
  isDirectMessage,
  senderName,
  threadLabel,
}: {
  isDirectMessage: boolean;
  senderName: string | null;
  threadLabel: string;
}): string => {
  if (isDirectMessage || senderName === null) {
    return senderName ?? threadLabel;
  }

  return t`${senderName} in ${threadLabel}`;
};
